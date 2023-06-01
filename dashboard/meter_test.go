// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/metrics"
)

func Test_newMeter(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now)

	assert.NotNil(t, met)
	assert.NotNil(t, met.registry)
	assert.NotNil(t, met.clock)
	assert.Equal(t, time.Second, met.period)
	assert.InDelta(t, now.UnixMilli(), met.start.UnixMilli(), float64(time.Millisecond))
}

func Test_meter_add_error(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now)

	sample := metrics.Sample{ // nolint:exhaustruct
		TimeSeries: metrics.TimeSeries{ // nolint:exhaustruct
			Metric: &metrics.Metric{ // nolint:exhaustruct
				Type: metrics.MetricType(-1),
			},
		},
	}

	assert.Error(t, met.add(sample))
}

func Test_meter_add(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now)

	sample := testSample(t, "foo", metrics.Counter, 1)

	assert.NoError(t, met.add(sample))

	metric := met.registry.Get("foo")

	assert.NotNil(t, metric)
	assert.Equal(t, 1.0, metric.Sink.(*metrics.CounterSink).Value) // nolint:forcetypeassert
}

func Test_meter_update_error(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now)

	sample := testSample(t, "", metrics.Gauge, 0)
	data, err := met.update(testSampleContainer(t, sample).toArray(), now)

	assert.Error(t, err)
	assert.Nil(t, data)
}

func Test_meter_update(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now)

	foo := testSample(t, "foo", metrics.Counter, 1)
	bar := testSample(t, "bar", metrics.Counter, 1)
	data, err := met.update(testSampleContainer(t, foo, bar).toArray(), now)

	assert.NoError(t, err)
	assert.NotNil(t, data)

	assert.Equal(t, 3, len(data))
	assert.Contains(t, data, "foo")
	assert.Contains(t, data, "bar")
	assert.Contains(t, data, "time")

	metric, ok := data["foo"]

	assert.True(t, ok)
	assert.Contains(t, metric.Sample, "count")
	assert.Contains(t, metric.Sample, "rate")
	assert.Equal(t, 1.0, metric.Sample["count"])
	assert.Equal(t, 1.0, metric.Sample["rate"])
}

func Test_meter_update_no_period(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(0, now)

	sample := testSample(t, "foo", metrics.Counter, 1)
	data, err := met.update(testSampleContainer(t, sample).toArray(), now)

	assert.NoError(t, err)
	assert.NotNil(t, data)

	assert.Equal(t, 2, len(data))
	assert.Contains(t, data, "foo")
	assert.Contains(t, data, "time")

	metric, ok := data["foo"]

	assert.True(t, ok)
	assert.Contains(t, metric.Sample, "count")
	assert.Contains(t, metric.Sample, "rate")
}
