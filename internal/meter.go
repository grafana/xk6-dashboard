// MIT License
//
// Copyright (c) 2023 Iván Szkiba
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
