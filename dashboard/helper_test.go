package dashboard

import (
	"testing"
	"time"

	"go.k6.io/k6/metrics"
)

func testSample(t *testing.T, name string, typ metrics.MetricType, value float64) metrics.Sample {
	t.Helper()

	return metrics.Sample{ // nolint:exhaustruct
		Time:  time.Now(),
		Value: value,
		TimeSeries: metrics.TimeSeries{ // nolint:exhaustruct
			Metric: &metrics.Metric{ // nolint:exhaustruct
				Name: name,
				Type: typ,
			},
		},
	}
}

type testSamples struct {
	samples []metrics.Sample
}

func testSampleContainer(t *testing.T, samples ...metrics.Sample) *testSamples {
	t.Helper()

	return &testSamples{samples: samples}
}

func (ts *testSamples) GetSamples() []metrics.Sample {
	return ts.samples
}

func (ts *testSamples) toArray() []metrics.SampleContainer {
	return []metrics.SampleContainer{ts}
}
