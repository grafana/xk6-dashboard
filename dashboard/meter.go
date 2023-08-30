// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"time"

	"go.k6.io/k6/metrics"
)

type meter struct {
	registry *registry

	clock  *metrics.GaugeSink
	period time.Duration
	start  time.Time
}

func newMeter(period time.Duration, now time.Time) *meter {
	registry := newRegistry()
	metric := registry.mustGetOrNew("time", metrics.Gauge, metrics.Time)
	clock, _ := metric.Sink.(*metrics.GaugeSink)

	start := now
	clock.Value = float64(start.UnixMilli())

	return &meter{
		registry: registry,
		start:    start,
		clock:    clock,
		period:   period,
	}
}

func (m *meter) update(containers []metrics.SampleContainer, now time.Time) (map[string]sampleData, error) {
	dur := m.period
	if dur == 0 {
		dur = now.Sub(m.start)
	}

	m.clock.Value = float64(now.UnixMilli())

	for _, container := range containers {
		for _, sample := range container.GetSamples() {
			if err := m.add(sample); err != nil {
				return nil, err
			}
		}
	}

	return m.format(dur), nil
}

func (m *meter) add(sample metrics.Sample) error {
	metric, err := m.registry.getOrNew(sample.Metric.Name, sample.Metric.Type, sample.Metric.Contains)
	if err != nil {
		return err
	}

	metric.Sink.Add(sample)

	return nil
}

func (m *meter) format(dur time.Duration) map[string]sampleData {
	out := make(map[string]sampleData, len(m.registry.names))

	for _, name := range m.registry.names {
		metric := m.registry.Get(name)
		if metric == nil {
			continue
		}

		sample := metric.Sink.Format(dur)

		if sink, ok := metric.Sink.(*metrics.TrendSink); ok {
			sample[pc99Name] = sink.P(pc99)
		}

		out[name] = sample
	}

	return out
}

func (m *meter) newbies(seen map[string]struct{}) map[string]metricData {
	names := m.registry.newbies(seen)
	if len(names) == 0 {
		return nil
	}

	newbies := make(map[string]metricData, len(names))

	for _, name := range names {
		metric := m.registry.Get(name)
		if metric == nil {
			continue
		}

		newbies[name] = *newMetricData(metric)
	}

	return newbies
}

type metricData struct {
	Type     metrics.MetricType `json:"type"`
	Contains metrics.ValueType  `json:"contains,omitempty"`
	Tainted  bool               `json:"tainted,omitempty"`
}

func newMetricData(origin *metrics.Metric) *metricData {
	return &metricData{
		Type:     origin.Type,
		Contains: origin.Contains,
		Tainted:  origin.Tainted.Bool,
	}
}

type sampleData map[string]float64

const (
	pc99     = 0.99
	pc99Name = "p(99)"
)
