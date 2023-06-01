// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bufio"
	"context"
	"net"
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
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

func getRandomPort(t *testing.T) int {
	t.Helper()

	listener, err := net.Listen("tcp", "127.0.0.1:0")

	assert.NoError(t, err)

	port := listener.Addr().(*net.TCPAddr).Port //nolint:forcetypeassert

	assert.NoError(t, listener.Close())

	return port
}

func getRandomAddr(t *testing.T) string {
	t.Helper()

	return net.JoinHostPort("127.0.0.1", strconv.Itoa(getRandomPort(t)))
}

func readSSE(t *testing.T, nlines int, loc string) []string {
	t.Helper()

	req, err := http.NewRequest(http.MethodGet, loc, nil)

	assert.NoError(t, err)

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Connection", "keep-alive")

	assert.NoError(t, err)

	ctx, cancel := context.WithCancel(context.TODO())
	defer cancel()

	req = req.WithContext(ctx)

	res, err := http.DefaultClient.Do(req) // nolint:bodyclose

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, res.StatusCode)
	assert.Equal(t, "text/event-stream", res.Header.Get("Content-Type"))

	scanner := bufio.NewScanner(res.Body)

	scanner.Split(bufio.ScanLines)

	lines := make([]string, 0, nlines)

	for idx := 0; idx < nlines; idx++ {
		if !scanner.Scan() {
			break
		}

		lines = append(lines, scanner.Text())
	}

	assert.Equal(t, nlines, len(lines))

	return lines
}
