// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"embed"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/metrics"
)

const testSampleCount = 312

func Test_feed(t *testing.T) {
	t.Parallel()

	var all []metrics.SampleContainer

	callback := func(samples []metrics.SampleContainer) {
		all = append(all, samples...)
	}

	assert.NoError(t, feed("testdata/result.json", callback))

	assert.Equal(t, testSampleCount, len(all))

	all = nil

	assert.NoError(t, feed("testdata/result.gz", callback))

	assert.Equal(t, testSampleCount, len(all))
}

func Test_replay(t *testing.T) {
	t.Parallel()

	opts := &options{
		Port:   getRandomPort(t),
		Host:   "127.0.0.1",
		Period: time.Second,
		Open:   false,
		Config: "",
		Report: "",
	}

	assert.NoError(t, replay(opts, embed.FS{}, "testdata/result.gz"))

	time.Sleep(time.Millisecond)

	lines := readSSE(t, 5, "http://"+opts.addr()+"/events")

	assert.Equal(t, 5, len(lines))
}

func Test_feeder_processMetric(t *testing.T) {
	t.Parallel()

	feeder := new(feeder)

	feeder.registry = newRegistry()

	err := feeder.processMetric([]byte(`{"type":"Metric","data":{"name":"http_reqs","type":"counter","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}`))

	assert.NoError(t, err)

	metric := feeder.registry.Get("http_reqs")

	assert.NotNil(t, metric)

	assert.Equal(t, metrics.Counter, metric.Type)
	assert.Equal(t, metrics.Default, metric.Contains)
}

func Test_feeder_processMetric_error(t *testing.T) {
	t.Parallel()

	feeder := new(feeder)

	feeder.registry = newRegistry()

	err := feeder.processMetric([]byte(`{"type":"Metric","data":{"name":"http_reqs","type":"UNKNOWN","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}`))

	assert.Error(t, err)

	err = feeder.processMetric([]byte(`{"type":"Metric","data":{"name":"http_reqs","type":"counter","contains":"UNKNOWN","thresholds":[],"submetrics":null},"metric":"http_reqs"}`))

	assert.Error(t, err)

	err = feeder.processMetric([]byte(`{"type":"Metric","data":{"name":"INVALID&METRIC*NAME","type":"counter","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}`))

	assert.Error(t, err)
}

func Test_feeder_processPoint(t *testing.T) {
	t.Parallel()

	var all []metrics.SampleContainer

	feeder := new(feeder)

	feeder.registry = newRegistry()
	feeder.callback = func(samples []metrics.SampleContainer) {
		all = append(all, samples...)
	}

	err := feeder.processMetric([]byte(`{"type":"Metric","data":{"name":"http_reqs","type":"counter","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}`))

	assert.NoError(t, err)

	err = feeder.processPoint([]byte(`{"metric":"http_reqs","type":"Point","data":{"time":"2023-05-24T19:12:26.129911031+02:00","value":1,"tags":{"expected_response":"true","group":"","method":"GET","name":"http://test.k6.io","proto":"HTTP/1.1","scenario":"contacts","status":"308","url":"http://test.k6.io"}}}`))

	assert.NoError(t, err)

	sample := all[0].GetSamples()[0]

	assert.Equal(t, 1.0, sample.Value)
}

func Test_feeder_processPoint_error(t *testing.T) {
	t.Parallel()

	feeder := new(feeder)

	feeder.registry = newRegistry()

	err := feeder.processPoint([]byte(`{"metric":"http_reqs","type":"Point","data":{"time":"2023-05-24T19:12:26.129911031+02:00","value":1,"tags":{"expected_response":"true","group":"","method":"GET","name":"http://test.k6.io","proto":"HTTP/1.1","scenario":"contacts","status":"308","url":"http://test.k6.io"}}}`))

	assert.Error(t, err)
}

func Test_feeder_processLine(t *testing.T) {
	t.Parallel()

	var all []metrics.SampleContainer

	feeder := new(feeder)

	feeder.registry = newRegistry()
	feeder.callback = func(samples []metrics.SampleContainer) {
		all = append(all, samples...)
	}

	err := feeder.processLine([]byte(`{"type":"Metric","data":{"name":"http_reqs","type":"counter","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}`))

	assert.NoError(t, err)

	err = feeder.processLine([]byte(`{"metric":"http_reqs","type":"Point","data":{"time":"2023-05-24T19:12:26.129911031+02:00","value":1,"tags":{"expected_response":"true","group":"","method":"GET","name":"http://test.k6.io","proto":"HTTP/1.1","scenario":"contacts","status":"308","url":"http://test.k6.io"}}}`))

	assert.NoError(t, err)

	sample := all[0].GetSamples()[0]

	assert.Equal(t, 1.0, sample.Value)
}
