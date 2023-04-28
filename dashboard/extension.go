// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"fmt"
	"io/fs"

	"github.com/sirupsen/logrus"
	"go.k6.io/k6/metrics"
	"go.k6.io/k6/output"
)

type Extension struct {
	buffer *output.SampleBuffer

	flusher *output.PeriodicFlusher
	logger  logrus.FieldLogger

	uiFS   fs.FS
	server *webServer

	options *options

	cumulative *meter

	description string
}

var _ output.Output = (*Extension)(nil)

// New creates Exension instance using the passwd uiFS as source of web UI.
func New(params output.Params, uiFS fs.FS) (*Extension, error) {
	opts, err := getopts(params.ConfigArgument)
	if err != nil {
		return nil, err
	}

	ext := &Extension{
		uiFS:        uiFS,
		logger:      params.Logger,
		options:     opts,
		description: fmt.Sprintf("%s (%s) %s", params.OutputType, opts.addr(), opts.url()),
		buffer:      nil,
		server:      nil,
		flusher:     nil,
		cumulative:  nil,
	}

	return ext, nil
}

func (ext *Extension) Description() string {
	return ext.description
}

func (ext *Extension) Start() error {
	var err error

	ext.cumulative = newMeter(0)

	ext.server, err = newWebServer(ext.uiFS, ext.logger)
	if err != nil {
		return err
	}

	go func() {
		if err := ext.server.listenAndServe(ext.options.addr()); err != nil {
			ext.logger.Error(err)
		}
	}()

	ext.buffer = new(output.SampleBuffer)

	flusher, err := output.NewPeriodicFlusher(ext.options.Period, ext.flush)
	if err != nil {
		return err
	}

	ext.flusher = flusher

	return nil
}

func (ext *Extension) Stop() error {
	ext.flusher.Stop()

	return nil
}

func (ext *Extension) AddMetricSamples(samples []metrics.SampleContainer) {
	ext.buffer.AddMetricSamples(samples)
}

func (ext *Extension) flush() {
	samples := ext.buffer.GetBufferedSamples()

	ext.updateAndSend(samples, newMeter(ext.options.Period), snapshotEvent)
	ext.updateAndSend(samples, ext.cumulative, cumulativeEvent)
}

func (ext *Extension) updateAndSend(containers []metrics.SampleContainer, m *meter, event string) {
	data, err := m.update(containers)
	if err != nil {
		ext.logger.WithError(err).Warn("Error while processing samples")

		return
	}

	ext.server.sendEvent(event, data)
}
