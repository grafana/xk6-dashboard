// MIT License
//
// Copyright (c) 2021 Iván Szkiba
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

package internal

import (
	"fmt"
	"io/fs"

	"github.com/sirupsen/logrus"
	"go.k6.io/k6/metrics"
	"go.k6.io/k6/output"
)

type Dashboard struct {
	buffer *output.SampleBuffer

	flusher *output.PeriodicFlusher
	logger  logrus.FieldLogger

	uiFS   fs.FS
	server *WebServer

	options *Options

	cumulative *Meter

	description string
}

var _ output.Output = (*Dashboard)(nil)

func NewDashboard(params output.Params, uiFS fs.FS) (*Dashboard, error) { //nolint:ireturn
	opts, err := ParseOptions(params.ConfigArgument)
	if err != nil {
		return nil, err
	}

	dash := &Dashboard{
		uiFS:        uiFS,
		logger:      params.Logger,
		options:     opts,
		description: fmt.Sprintf("%s (%s) %s", params.OutputType, opts.Addr(), opts.URL()),
		buffer:      nil,
		server:      nil,
		flusher:     nil,
		cumulative:  nil,
	}

	return dash, nil
}

func (dash *Dashboard) Description() string {
	return dash.description
}

func (dash *Dashboard) Start() error {
	var err error

	dash.cumulative = NewMeter(0)

	dash.server, err = NewWebServer(dash.uiFS, dash.logger)
	if err != nil {
		return err
	}

	go func() {
		if err := dash.server.ListenAndServe(dash.options.Addr()); err != nil {
			dash.logger.Error(err)
		}
	}()

	dash.buffer = new(output.SampleBuffer)

	flusher, err := output.NewPeriodicFlusher(dash.options.Period, dash.flush)
	if err != nil {
		return err
	}

	dash.flusher = flusher

	return nil
}

func (dash *Dashboard) Stop() error {
	dash.flusher.Stop()

	return nil
}

func (dash *Dashboard) AddMetricSamples(samples []metrics.SampleContainer) {
	dash.buffer.AddMetricSamples(samples)
}

func (dash *Dashboard) flush() {
	samples := dash.buffer.GetBufferedSamples()

	dash.updateAndSend(samples, NewMeter(dash.options.Period), snapshotEvent)
	dash.updateAndSend(samples, dash.cumulative, cumulativeEvent)
}

func (dash *Dashboard) updateAndSend(containers []metrics.SampleContainer, meter *Meter, event string) {
	data, err := meter.Update(containers)
	if err != nil {
		dash.logger.WithError(err).Warn("Error while processing samples")

		return
	}

	dash.server.SendEvent(event, data)
}
