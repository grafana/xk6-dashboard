// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"time"

	v1 "go.k6.io/k6/api/v1"
	"go.k6.io/k6/metrics"
)

type Meter struct {
	registry *Registry

	clock  *metrics.GaugeSink
	period time.Duration
	start  time.Time
}

func NewMeter(period time.Duration) *Meter {
	registry := NewRegistry()
	metric := registry.MustGetOrNew("time", metrics.Gauge, metrics.Time)
	clock, _ := metric.Sink.(*metrics.GaugeSink)

	start := time.Now()
	clock.Value = float64(start.UnixMilli())

	return &Meter{
		registry: registry,
		start:    start,
		clock:    clock,
		period:   period,
	}
}

func (meter *Meter) Update(containers []metrics.SampleContainer) (map[string]v1.Metric, error) {
	now := time.Now()

	dur := meter.period
	if dur == 0 {
		dur = now.Sub(meter.start)
	}

	meter.clock.Value = float64(now.UnixMilli())

	for _, container := range containers {
		for _, sample := range container.GetSamples() {
			if err := meter.add(sample); err != nil {
				return nil, err
			}
		}
	}

	return meter.registry.Format(dur), nil
}

func (meter *Meter) add(sample metrics.Sample) error {
	metric, err := meter.registry.GetOrNew(sample.Metric.Name, sample.Metric.Type, sample.Metric.Contains)
	if err != nil {
		return err
	}

	metric.Sink.Add(sample)

	return nil
}
