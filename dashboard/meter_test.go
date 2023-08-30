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

	sample, ok := data["foo"]

	assert.True(t, ok)
	assert.Contains(t, sample, "count")
	assert.Contains(t, sample, "rate")
	assert.Equal(t, 1.0, sample["count"])
	assert.Equal(t, 1.0, sample["rate"])
}

func Test_meter_update_no_period(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(0, now)

	aSample := testSample(t, "foo", metrics.Counter, 1)
	data, err := met.update(testSampleContainer(t, aSample).toArray(), now)

	assert.NoError(t, err)
	assert.NotNil(t, data)

	assert.Equal(t, 2, len(data))
	assert.Contains(t, data, "foo")
	assert.Contains(t, data, "time")

	sample, ok := data["foo"]

	assert.True(t, ok)
	assert.Contains(t, sample, "count")
	assert.Contains(t, sample, "rate")
}

func Test_meter_format(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(0, now)

	met.registry.getOrNew("foo", metrics.Counter, metrics.Data) // nolint:errcheck
	met.registry.getOrNew("bar", metrics.Counter, metrics.Data) // nolint:errcheck

	data := met.format(time.Second)

	assert.NotNil(t, data)

	assert.Equal(t, 3, len(data))
	assert.Contains(t, data, "time")
	assert.Contains(t, data, "foo")
	assert.Contains(t, data, "bar")
}

func Test_significant(t *testing.T) {
	t.Parallel()

	assert.Equal(t, 123456.0, significant(123456.7890))
	assert.Equal(t, 12345.0, significant(12345.678))
	assert.Equal(t, 1234.5, significant(1234.5678))
	assert.Equal(t, 123.45, significant(123.45678))
	assert.Equal(t, 12.345, significant(12.345678))
	assert.Equal(t, 1.2345, significant(1.2345678))
	assert.Equal(t, 0.12345, significant(0.12345678))
	assert.Equal(t, 0.01234, significant(0.012345678))
	assert.Equal(t, 0.00123, significant(0.0012345678))
	assert.Equal(t, 0.00012, significant(0.00012345678))
	assert.Equal(t, 0.00001, significant(0.000012345678))
	assert.Equal(t, 0.0, significant(0.0000012345678))
}
