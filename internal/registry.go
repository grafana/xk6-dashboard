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
