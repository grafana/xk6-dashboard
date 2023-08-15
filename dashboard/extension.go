// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"fmt"
	"io/fs"
	"time"

	"github.com/pkg/browser"
	"github.com/sirupsen/logrus"
	"go.k6.io/k6/metrics"
	"go.k6.io/k6/output"
)

type Extension struct {
	*eventSource

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

// New creates Extension instance using the passwd uiFS as source of web UI.
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
		eventSource: new(eventSource),
	}

	return ext, nil
}

func (ext *Extension) Description() string {
	return ext.description
}

func (ext *Extension) Start() error {
	config, err := ext.options.config()
	if err != nil {
		return err
	}

	ext.cumulative = newMeter(0, time.Now())

	ext.server = newWebServer(ext.uiFS, config, ext.logger)
	ext.addEventListener(ext.server)

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

	if ext.options.Open {
		browser.OpenURL(ext.options.url()) // nolint:errcheck
	}

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
	now := time.Now()

	ext.updateAndSend(samples, newMeter(ext.options.Period, now), snapshotEvent, now)
	ext.updateAndSend(samples, ext.cumulative, cumulativeEvent, now)
}

func (ext *Extension) updateAndSend(containers []metrics.SampleContainer, m *meter, event string, now time.Time) {
	data, err := m.update(containers, now)
	if err != nil {
		ext.logger.WithError(err).Warn("Error while processing samples")

		return
	}

	ext.fireEvent(event, data)
}
