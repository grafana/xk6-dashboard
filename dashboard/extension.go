// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
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

	seenMetrics map[string]struct{}

	period time.Duration

	name string

	briefFS fs.FS

	uiConfig json.RawMessage

	param *paramData
}

var _ output.Output = (*Extension)(nil)

var Customize = func(uiConfig json.RawMessage) (json.RawMessage, error) {
	return uiConfig, nil
}

// New creates Extension instance using the passwd uiFS as source of web UI.
func New(params output.Params, uiConfig json.RawMessage, uiFS fs.FS, briefFS fs.FS) (*Extension, error) {
	uiConfig, err := Customize(uiConfig)
	if err != nil {
		return nil, err
	}

	opts, err := getopts(params.ConfigArgument)
	if err != nil {
		return nil, err
	}

	offset, _ := lib.GetEndOffset(params.ExecutionPlan)
	period := opts.period(offset)

	ext := &Extension{
		uiFS:        uiFS,
		briefFS:     briefFS,
		uiConfig:    uiConfig,
		logger:      params.Logger,
		options:     opts,
		name:        params.OutputType,
		buffer:      nil,
		server:      nil,
		flusher:     nil,
		cumulative:  nil,
		seenMetrics: nil,
		param:       newParamData(&params).withPeriod(period).withEndOffest(offset),
		period:      period,
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

func (ext *Extension) SetThresholds(thresholds map[string]metrics.Thresholds) {
	ext.param.withThresholds(thresholds)
}

func (ext *Extension) Start() error {
	brf := newBriefer(ext.briefFS, ext.uiConfig, ext.options.Report, ext.logger)

	ext.addEventListener(brf)

	if ext.options.Port >= 0 {
		ext.server = newWebServer(ext.uiFS, brf, ext.logger)
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

	ext.cumulative = newMeter(0, time.Now(), ext.options.Tags)
	ext.seenMetrics = make(map[string]struct{})

	if err := ext.fireStart(); err != nil {
		return err
	}

	ext.buffer = new(output.SampleBuffer)

	now := time.Now()

	ext.fireEvent(configEvent, ext.uiConfig)
	ext.fireEvent(paramEvent, ext.param)

	ext.updateAndSend(nil, newMeter(ext.period, now, ext.cumulative.tags), startEvent, now)

	flusher, err := output.NewPeriodicFlusher(ext.period, ext.flush)
	if err != nil {
		return err
	}

	ext.flusher = flusher

	return nil
}

func (ext *Extension) Stop() error {
	ext.flusher.Stop()

	now := time.Now()

	ext.updateAndSend(nil, newMeter(ext.period, now, ext.options.Tags), stopEvent, now)

	return ext.fireStop()
}

func (ext *Extension) AddMetricSamples(samples []metrics.SampleContainer) {
	ext.buffer.AddMetricSamples(samples)
}

func (ext *Extension) flush() {
	samples := ext.buffer.GetBufferedSamples()
	now := time.Now()

	ext.updateAndSend(samples, newMeter(ext.period, now, ext.options.Tags), snapshotEvent, now)
	ext.updateAndSend(samples, ext.cumulative, cumulativeEvent, now)
}

func (ext *Extension) updateAndSend(containers []metrics.SampleContainer, met *meter, event string, now time.Time) {
	data, err := met.update(containers, now)
	if err != nil {
		ext.logger.WithError(err).Warn("Error while processing samples")

		return
	}

	newbies := met.newbies(ext.seenMetrics)
	if len(newbies) != 0 {
		ext.fireEvent(metricEvent, newbies)
	}

	ext.fireEvent(event, data)
}

type paramData struct {
	Thresholds map[string][]string `json:"thresholds,omitempty"`
	Scenarios  []string            `json:"scenarios,omitempty"`
	EndOffset  time.Duration       `json:"endOffset,omitempty"`
	Period     time.Duration       `json:"period,omitempty"`
	Tags       []string            `json:"tags,omitempty"`
}

func newParamData(params *output.Params) *paramData {
	param := new(paramData)

	for name := range params.ScriptOptions.Scenarios {
		param.Scenarios = append(param.Scenarios, name)
	}

	return param
}

func (param *paramData) withTags(tags []string) *paramData {
	param.Tags = tags

	return param
}

func (param *paramData) withThresholds(thresholds map[string]metrics.Thresholds) *paramData {
	if len(thresholds) == 0 {
		return param
	}

	param.Thresholds = make(map[string][]string, len(thresholds))

	for name, value := range thresholds {
		tre := make([]string, 0, len(value.Thresholds))

		for _, threshold := range value.Thresholds {
			tre = append(tre, threshold.Source)
		}

		param.Thresholds[name] = tre
	}

	return param
}

func (param *paramData) withPeriod(period time.Duration) *paramData {
	param.Period = time.Duration(period.Milliseconds())

	return param
}

func (param *paramData) withEndOffest(offset time.Duration) *paramData {
	param.EndOffset = time.Duration(offset.Milliseconds())

	return param
}
