// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.k6.io/k6/metrics"
)

func Test_newMeter(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now, nil)

	require.NotNil(t, met)
	require.NotNil(t, met.registry)
	require.NotNil(t, met.clock)
	require.Equal(t, time.Second, met.period)
	require.InDelta(t, now.UnixMilli(), met.start.UnixMilli(), float64(time.Millisecond))
}

func Test_meter_add_error(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now, nil)

	sample := metrics.Sample{ //nolint:exhaustruct
		TimeSeries: metrics.TimeSeries{ //nolint:exhaustruct
			Metric: &metrics.Metric{ //nolint:exhaustruct
				Type: metrics.MetricType(-1),
			},
		},
	}

	require.Error(t, met.add(sample))
}

func Test_meter_add(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now, nil)

	sample := testSample(t, "foo", metrics.Counter, 1)

	require.NoError(t, met.add(sample))

	metric := met.registry.Get("foo")

	require.NotNil(t, metric)

	counter, ok := metric.Sink.(*metrics.CounterSink)
	require.True(t, ok)

	require.InDelta(t, 1.0, counter.Value, 0.00000001)
}

func Test_meter_update_error(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now, nil)

	sample := testSample(t, "", metrics.Gauge, 0)
	data, err := met.update(testSampleContainer(t, sample).toArray(), now)

	require.Error(t, err)
	require.Nil(t, data)
}

func Test_meter_update(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now, nil)

	const (
		fooVal = 2.0
		barVal = 1.0
		delta  = 0.00000001
	)

	foo := testSample(t, "foo", metrics.Counter, fooVal)
	bar := testSample(t, "bar", metrics.Counter, barVal)
	data, err := met.update(testSampleContainer(t, foo, bar).toArray(), now)

	require.NoError(t, err)
	require.NotNil(t, data)

	require.Len(t, data, 3)
	require.InDelta(t, barVal, data[0][0], delta)
	require.InDelta(t, barVal, data[0][1], delta)
	require.InDelta(t, fooVal, data[1][0], delta)
	require.InDelta(t, fooVal, data[1][1], delta)
}

func Test_meter_update_no_period(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(0, now, nil)

	const (
		fooVal = 1.0
		delta  = 0.00000001
	)

	aSample := testSample(t, "foo", metrics.Counter, fooVal)
	data, err := met.update(testSampleContainer(t, aSample).toArray(), now)

	require.NoError(t, err)
	require.NotNil(t, data)

	require.Len(t, data, 2)
	require.InDelta(t, fooVal, data[0][0], delta)
}

func Test_meter_format(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(0, now, nil)

	_, _ = met.registry.getOrNew("foo", metrics.Counter, metrics.Data, nil)
	_, _ = met.registry.getOrNew("bar", metrics.Counter, metrics.Data, nil)

	data := met.format(time.Second)

	require.NotNil(t, data)

	require.Len(t, data, 3)

	require.Equal(t, []sampleData{
		[]float64{},
		[]float64{},
		[]float64{float64(now.UnixMilli())},
	}, data)
}

func Test_meter_evaluate(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(0, now, nil)

	foo, err := met.registry.getOrNew(
		"foo",
		metrics.Counter,
		metrics.Data,
		[]string{"count < 1", "count < 100"},
	)
	require.NoError(t, err)
	foo.Sink.Add(metrics.Sample{TimeSeries: metrics.TimeSeries{Metric: foo}, Time: now, Value: 2})

	bar, err := met.registry.getOrNew(
		"bar",
		metrics.Counter,
		metrics.Data,
		[]string{"count < 1"},
	)
	require.NoError(t, err)
	bar.Sink.Add(metrics.Sample{TimeSeries: metrics.TimeSeries{Metric: bar}, Time: now, Value: 1})

	data := met.evaluate(now)

	require.NotNil(t, data)

	require.Len(t, data, 2)
	require.Contains(t, data, "foo")
	require.Contains(t, data, "bar")
	require.Equal(t, []string{"count < 1"}, data["foo"])
	require.Equal(t, []string{"count < 1"}, data["bar"])
}

func Test_meter_update_tags(t *testing.T) {
	t.Parallel()

	now := time.Now()
	met := newMeter(time.Second, now, nil)

	const (
		fooVal = 2.0
		barVal = 1.0
		delta  = 0.00000001
	)

	foo := testSample(t, "foo", metrics.Counter, fooVal)
	bar := testSample(t, "bar", metrics.Counter, barVal)

	met.tags = []string{"answer"}

	bar.Tags = met.registry.RootTagSet().With("answer", "42")
	foo.Tags = met.registry.RootTagSet().With("color", "blue")

	data, err := met.update(testSampleContainer(t, foo, bar).toArray(), now)

	require.NoError(t, err)
	require.NotNil(t, data)

	require.Len(t, data, 4)
	require.InDelta(t, fooVal, data[2][0], delta)
	require.InDelta(t, barVal, data[0][0], delta)
	require.InDelta(t, barVal, data[1][0], delta)
}

func Test_significant(t *testing.T) {
	t.Parallel()

	const delta = 0.00000001

	require.InDelta(t, 123456.0, significant(123456.7890), delta)
	require.InDelta(t, 12345.0, significant(12345.678), delta)
	require.InDelta(t, 1234.5, significant(1234.5678), delta)
	require.InDelta(t, 123.45, significant(123.45678), delta)
	require.InDelta(t, 12.345, significant(12.345678), delta)
	require.InDelta(t, 1.2345, significant(1.2345678), delta)
	require.InDelta(t, 0.12345, significant(0.12345678), delta)
	require.InDelta(t, 0.01234, significant(0.012345678), delta)
	require.InDelta(t, 0.00123, significant(0.0012345678), delta)
	require.InDelta(t, 0.00012, significant(0.00012345678), delta)
	require.InDelta(t, 0.00001, significant(0.000012345678), delta)
	require.InDelta(t, 0.0, significant(0.0000012345678), delta)
}
