// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"time"

	v1 "go.k6.io/k6/api/v1"
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

func (m *meter) update(containers []metrics.SampleContainer, now time.Time) (map[string]v1.Metric, error) {
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

	return m.registry.format(dur), nil
}

func (m *meter) add(sample metrics.Sample) error {
	metric, err := m.registry.getOrNew(sample.Metric.Name, sample.Metric.Type, sample.Metric.Contains)
	if err != nil {
		return err
	}

	metric.Sink.Add(sample)

	return nil
}
