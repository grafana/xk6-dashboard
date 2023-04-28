// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"time"

	v1 "go.k6.io/k6/api/v1"
	"go.k6.io/k6/metrics"
)

// Registry is what can create metrics and make them iterable.
type Registry struct {
	*metrics.Registry
	names []string
}

// NewRegistry returns a new Registry.
func NewRegistry() *Registry {
	return &Registry{
		Registry: metrics.NewRegistry(),
		names:    make([]string, 0),
	}
}

// GetOrNew returns existing metric or create new metric registered to this Registry.
func (reg *Registry) GetOrNew(name string, typ metrics.MetricType, valTyp ...metrics.ValueType) (*metrics.Metric, error) {
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

// MustGetOrNew is like GetOrNew, but will panic if there is an error.
func (reg *Registry) MustGetOrNew(name string, typ metrics.MetricType, valTyp ...metrics.ValueType) *metrics.Metric {
	metric, err := reg.GetOrNew(name, typ, valTyp...)
	if err != nil {
		panic(err)
	}

	return metric
}

// Format creates k6 REST API v1 compatible output map from all registered metrics.
func (reg *Registry) Format(dur time.Duration) map[string]v1.Metric {
	out := make(map[string]v1.Metric, len(reg.names))

	for _, name := range reg.names {
		metric := reg.Get(name)
		if metric == nil {
			continue
		}

		out[name] = v1.NewMetric(metric, dur)
	}

	return out
}
