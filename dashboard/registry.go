// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"time"

	v1 "go.k6.io/k6/api/v1"
	"go.k6.io/k6/metrics"
)

// registry is what can create metrics and make them iterable.
type registry struct {
	*metrics.Registry
	names []string
}

// newRegistry returns a new registry.
func newRegistry() *registry {
	return &registry{
		Registry: metrics.NewRegistry(),
		names:    make([]string, 0),
	}
}

// getOrNew returns existing metric or create new metric registered to this registry.
func (reg *registry) getOrNew(name string, typ metrics.MetricType, valTyp ...metrics.ValueType) (*metrics.Metric, error) {
	if metric := reg.Registry.Get(name); metric != nil {
		return metric, nil
	}

	metric, err := reg.Registry.NewMetric(name, typ, valTyp...)
	if err != nil {
		return nil, err
	}

	reg.names = append(reg.names, name)

	return metric, nil
}

// mustGetOrNew is like getOrNew, but will panic if there is an error.
func (reg *registry) mustGetOrNew(name string, typ metrics.MetricType, valTyp ...metrics.ValueType) *metrics.Metric {
	metric, err := reg.getOrNew(name, typ, valTyp...)
	if err != nil {
		panic(err)
	}

	return metric
}

// format creates k6 REST API v1 compatible output map from all registered metrics.
func (reg *registry) format(dur time.Duration) map[string]v1.Metric {
	out := make(map[string]v1.Metric, len(reg.names))

	for _, name := range reg.names {
		metric := reg.Get(name)
		if metric == nil {
			continue
		}

		v1metric := v1.NewMetric(metric, dur)

		if sink, ok := metric.Sink.(*metrics.TrendSink); ok {
			v1metric.Sample[pc99Name] = sink.P(pc99)
		}

		out[name] = v1metric
	}

	return out
}

const (
	pc99     = 0.99
	pc99Name = "p(99)"
)
