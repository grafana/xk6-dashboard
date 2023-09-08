// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bufio"
	"context"
	"embed"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/lib/fsext"
	"go.k6.io/k6/metrics"
)

//go:embed testdata
var testdata embed.FS

type testHelper struct {
	proc   *process
	assets *assets
}

func newTestAssets(t *testing.T) *assets {
	t.Helper()

	const prefix = "testdata/assets/packages/"

	config, err := testdata.ReadFile(prefix + "config/dist/config.json")
	if err != nil {
		panic(err)
	}

	return &assets{
		ui:     assetDir(prefix+"ui/dist", testdata),
		report: assetDir(prefix+"report/dist", testdata),
		config: config,
	}
}

func helper(t *testing.T) *testHelper {
	t.Helper()

	gs := state.NewGlobalState(context.Background())

	proc := &process{
		logger: gs.Logger,
		fs:     fsext.NewMemMapFs(),
		env:    gs.Env,
	}

	return &testHelper{
		proc:   proc,
		assets: newTestAssets(t),
	}
}

func (th *testHelper) osFs() *testHelper {
	th.proc.fs = fsext.NewOsFs()

	return th
}

func testSample(t *testing.T, name string, typ metrics.MetricType, value float64) metrics.Sample {
	t.Helper()

	return metrics.Sample{ //nolint:exhaustruct
		Time:  time.Now(),
		Value: value,
		TimeSeries: metrics.TimeSeries{ //nolint:exhaustruct
			Metric: &metrics.Metric{ //nolint:exhaustruct
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

	res, err := http.DefaultClient.Do(req) //nolint:bodyclose

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

	cancel()

	time.Sleep(10 * time.Millisecond) // allow unsubscribe to run

	return lines
}
