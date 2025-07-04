// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"net/url"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"go.k6.io/k6/lib"
	"go.k6.io/k6/lib/fsext"
	"go.k6.io/k6/metrics"
	"go.k6.io/k6/output"
)

func TestNewExtension(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.ConfigArgument = "port=1&host=localhost"
	params.OutputType = "dashboard"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	require.Equal(t, "dashboard http://localhost:1", ext.Description())

	params.ConfigArgument = "period=2"

	_, err = New(params)

	require.Error(t, err)
}

func testReadSSE(t *testing.T, nlines int) []string {
	t.Helper()

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=0"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	require.NoError(t, err)
	require.NoError(t, ext.Start())

	done := make(chan struct{})

	go func() {
		sample := testSample(t, "foo", metrics.Counter, 1)

		ext.AddMetricSamples(testSampleContainer(t, sample).toArray())

		done <- struct{}{}
	}()

	<-done

	dashboard, ok := ext.(*extension)

	require.True(t, ok)

	lines := readSSE(t, nlines, "http://"+dashboard.options.addr()+"/events")

	require.NotNil(t, lines)

	require.NoError(t, ext.Stop())

	return lines
}

func TestExtension(t *testing.T) {
	t.Parallel()

	lines := testReadSSE(t, 28)

	const (
		dataPrefix          = `data: {"`
		aggregateDataPrefix = `data: [[`
		idPrefix            = `id: `
	)

	require.True(t, strings.HasPrefix(lines[0], idPrefix))
	require.True(t, strings.HasPrefix(lines[1], dataPrefix))
	require.Equal(t, "event: config", lines[2])
	require.Empty(t, lines[3])

	require.True(t, strings.HasPrefix(lines[4], idPrefix))
	require.True(t, strings.HasPrefix(lines[5], dataPrefix))
	require.Equal(t, "event: param", lines[6])
	require.Empty(t, lines[7])

	require.True(t, strings.HasPrefix(lines[8], idPrefix))
	require.True(t, strings.HasPrefix(lines[9], dataPrefix))
	require.Equal(t, "event: metric", lines[10])
	require.Empty(t, lines[11])

	require.True(t, strings.HasPrefix(lines[12], idPrefix))
	require.True(t, strings.HasPrefix(lines[13], aggregateDataPrefix))
	require.Equal(t, "event: start", lines[14])
	require.Empty(t, lines[15])

	require.True(t, strings.HasPrefix(lines[16], idPrefix))
	require.True(t, strings.HasPrefix(lines[17], dataPrefix))
	require.Equal(t, "event: metric", lines[18])
	require.Empty(t, lines[19])

	require.True(t, strings.HasPrefix(lines[20], idPrefix))
	require.True(t, strings.HasPrefix(lines[21], aggregateDataPrefix))
	require.Equal(t, "event: cumulative", lines[22])
	require.Empty(t, lines[23])

	require.True(t, strings.HasPrefix(lines[24], idPrefix))
	require.True(t, strings.HasPrefix(lines[25], aggregateDataPrefix))
	require.Equal(t, "event: snapshot", lines[26])
	require.Empty(t, lines[27])
}

func TestExtension_no_http(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.OutputType = "bar"
	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=-1"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	require.NoError(t, ext.Start())

	dashboard, ok := ext.(*extension)

	require.True(t, ok)

	require.Equal(t, -1, dashboard.options.Port)
	require.Equal(t, "bar", ext.Description())

	require.NoError(t, ext.Stop())
}

func TestExtension_random_port(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.OutputType = "foo"
	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=0"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	require.NoError(t, ext.Start())

	dashboard, ok := ext.(*extension)

	require.True(t, ok)

	require.Positive(t, dashboard.options.Port)

	require.Equal(
		t,
		"foo "+dashboard.options.url(),
		ext.Description(),
	)

	require.NoError(t, ext.Stop())
}

func TestExtension_error_used_port(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=0"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	require.NoError(t, ext.Start())

	dashboard, ok := ext.(*extension)

	require.True(t, ok)

	params.ConfigArgument = "port=" + strconv.Itoa(dashboard.options.Port)

	ext2, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext2)

	require.Error(t, ext2.Start())

	require.NoError(t, ext.Stop())
}

func TestExtension_open(t *testing.T) {
	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=0&open"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	t.Setenv("PATH", "")

	require.NoError(t, ext.Start())
	require.NoError(t, ext.Stop())
}

func TestExtension_report(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	file, err := osFS.Create("temp")

	require.NoError(t, err)
	require.NoError(t, file.Close())

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=-1&report=" + file.Name() + ".gz"
	params.FS = osFS

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	require.NoError(t, ext.Start())

	time.Sleep(time.Millisecond)

	go func() {
		sample := testSample(t, "foo", metrics.Counter, 1)

		ext.AddMetricSamples(testSampleContainer(t, sample).toArray())
	}()

	time.Sleep(100 * time.Millisecond)

	require.NoError(t, ext.Stop())

	st, err := osFS.Stat(file.Name() + ".gz")

	require.NoError(t, err)

	require.Greater(t, st.Size(), int64(1024))

	require.NoError(t, osFS.Remove(file.Name()+".gz"))
}

func TestExtension_skip_report(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	file, err := osFS.Create("temp")

	require.NoError(t, err)
	require.NoError(t, file.Close())

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=-1&report=" + file.Name() + ".gz"
	params.FS = osFS

	ext, err := New(params)

	require.NoError(t, err)
	require.NotNil(t, ext)

	require.NoError(t, ext.Start())

	require.NoError(t, ext.Stop())

	_, err = osFS.Stat(file.Name() + ".gz")

	require.Error(t, err)
}

func Test_newParamData(t *testing.T) {
	t.Parallel()

	params := new(output.Params)

	params.ScriptOptions.Scenarios = lib.ScenarioConfigs{
		"foo": nil,
		"bar": nil,
	}

	param := newParamData(params)

	require.Len(t, param.Scenarios, 2)
	require.Empty(t, param.ScriptPath)

	params.ScriptOptions.Scenarios = nil

	u, err := url.Parse("file:///tmp/script.js")
	require.NoError(t, err)

	params.ScriptPath = u

	param = newParamData(params)

	require.Empty(t, param.Scenarios)
	require.Equal(t, "file:///tmp/script.js", param.ScriptPath)
}

func Test_paramData_With(t *testing.T) {
	t.Parallel()

	param := new(paramData)

	period := time.Hour

	require.Same(t, param, param.withPeriod(period))

	require.Equal(t, time.Duration(period.Milliseconds()), param.Period)
	require.Empty(t, param.EndOffset)

	param = new(paramData)

	require.Same(t, param, param.withEndOffest(period))
	require.Equal(t, time.Duration(period.Milliseconds()), param.EndOffset)
	require.Empty(t, param.Period)

	param = new(paramData)

	thresholds := map[string]metrics.Thresholds{}

	require.Same(t, param, param.withThresholds(thresholds))
	require.Nil(t, param.Thresholds)

	thresholds["foo"] = metrics.Thresholds{ //nolint:exhaustruct
		Thresholds: []*metrics.Threshold{ //nolint:exhaustruct
			{Source: "a > 2"},
			{Source: "b > 3"},
		},
	}

	thresholds["bar"] = metrics.Thresholds{ //nolint:exhaustruct
		Thresholds: []*metrics.Threshold{ //nolint:exhaustruct
			{Source: "c > 1"},
			{Source: "d > 0"},
		},
	}

	require.Same(t, param, param.withThresholds(thresholds))
	require.Equal(t, []string{"a > 2", "b > 3"}, param.Thresholds["foo"])
	require.Equal(t, []string{"c > 1", "d > 0"}, param.Thresholds["bar"])
	require.Len(t, param.Thresholds, 2)

	ext := new(extension)

	ext.param = new(paramData)

	ext.SetThresholds(thresholds)

	require.Equal(t, param, ext.param)
}

func Test_paramData_withTags(t *testing.T) {
	t.Parallel()

	param := new(paramData)

	require.Same(t, param, param.withTags([]string{"foo", "bar"}))
	require.Equal(t, []string{"foo", "bar"}, param.Tags)
}
