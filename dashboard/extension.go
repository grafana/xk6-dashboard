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
	"go.k6.io/k6/lib"
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

	period time.Duration

	name string

	briefFS fs.FS
}

var _ output.Output = (*Extension)(nil)

// New creates Extension instance using the passwd uiFS as source of web UI.
func New(params output.Params, uiFS fs.FS, briefFS fs.FS) (*Extension, error) {
	opts, err := getopts(params.ConfigArgument)
	if err != nil {
		return nil, err
	}

	offset, _ := lib.GetEndOffset(params.ExecutionPlan)

	ext := &Extension{
		uiFS:        uiFS,
		briefFS:     briefFS,
		logger:      params.Logger,
		options:     opts,
		name:        params.OutputType,
		buffer:      nil,
		server:      nil,
		flusher:     nil,
		cumulative:  nil,
		period:      opts.period(offset),
		eventSource: new(eventSource),
	}

	return ext, nil
}

func (ext *Extension) Description() string {
	if ext.options.Port < 0 {
		return ext.name
	}

	return fmt.Sprintf("%s (%s) %s", ext.name, ext.options.addr(), ext.options.url())
}

func (ext *Extension) Start() error {
	config, err := ext.options.config()
	if err != nil {
		return err
	}

	if ext.options.Port >= 0 {
		ext.server = newWebServer(ext.uiFS, config, ext.logger)
		ext.addEventListener(ext.server)

		addr, err := ext.server.listenAndServe(ext.options.addr())
		if err != nil {
			return err
		}

		if ext.options.Port == 0 {
			ext.options.Port = addr.Port
		}

		if ext.options.Open {
			browser.OpenURL(ext.options.url()) // nolint:errcheck
		}
	}

	ext.cumulative = newMeter(0, time.Now())

	if len(ext.options.Report) != 0 {
		brf := newBriefer(ext.briefFS, config, ext.options.Report, ext.logger)

		ext.addEventListener(brf)
	}

	if err := ext.fireStart(); err != nil {
		return err
	}

	ext.buffer = new(output.SampleBuffer)

	flusher, err := output.NewPeriodicFlusher(ext.period, ext.flush)
	if err != nil {
		return err
	}

	ext.flusher = flusher

	return nil
}

func (ext *Extension) Stop() error {
	ext.flusher.Stop()

	return ext.fireStop()
}

func (ext *Extension) AddMetricSamples(samples []metrics.SampleContainer) {
	ext.buffer.AddMetricSamples(samples)
}

func (ext *Extension) flush() {
	samples := ext.buffer.GetBufferedSamples()
	now := time.Now()

	ext.updateAndSend(samples, newMeter(ext.period, now), snapshotEvent, now)
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
