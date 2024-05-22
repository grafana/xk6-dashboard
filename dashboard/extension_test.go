// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
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

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.Equal(t, "dashboard http://localhost:1", ext.Description())

	params.ConfigArgument = "period=2"

	_, err = New(params)

	assert.Error(t, err)
}

func testReadSSE(t *testing.T, nlines int) []string {
	t.Helper()

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=0"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NoError(t, ext.Start())

	done := make(chan struct{})

	go func() {
		sample := testSample(t, "foo", metrics.Counter, 1)

		ext.AddMetricSamples(testSampleContainer(t, sample).toArray())

		done <- struct{}{}
	}()

	<-done

	dashboard, ok := ext.(*extension)

	assert.True(t, ok)

	lines := readSSE(t, nlines, "http://"+dashboard.options.addr()+"/events")

	assert.NotNil(t, lines)

	assert.NoError(t, ext.Stop())

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

	assert.True(t, strings.HasPrefix(lines[0], idPrefix))
	assert.True(t, strings.HasPrefix(lines[1], dataPrefix))
	assert.Equal(t, "event: config", lines[2])
	assert.Empty(t, lines[3])

	assert.True(t, strings.HasPrefix(lines[4], idPrefix))
	assert.True(t, strings.HasPrefix(lines[5], dataPrefix))
	assert.Equal(t, "event: param", lines[6])
	assert.Empty(t, lines[7])

	assert.True(t, strings.HasPrefix(lines[8], idPrefix))
	assert.True(t, strings.HasPrefix(lines[9], dataPrefix))
	assert.Equal(t, "event: metric", lines[10])
	assert.Empty(t, lines[11])

	assert.True(t, strings.HasPrefix(lines[12], idPrefix))
	assert.True(t, strings.HasPrefix(lines[13], aggregateDataPrefix))
	assert.Equal(t, "event: start", lines[14])
	assert.Empty(t, lines[15])

	assert.True(t, strings.HasPrefix(lines[16], idPrefix))
	assert.True(t, strings.HasPrefix(lines[17], dataPrefix))
	assert.Equal(t, "event: metric", lines[18])
	assert.Empty(t, lines[19])

	assert.True(t, strings.HasPrefix(lines[20], idPrefix))
	assert.True(t, strings.HasPrefix(lines[21], aggregateDataPrefix))
	assert.Equal(t, "event: cumulative", lines[22])
	assert.Empty(t, lines[23])

	assert.True(t, strings.HasPrefix(lines[24], idPrefix))
	assert.True(t, strings.HasPrefix(lines[25], aggregateDataPrefix))
	assert.Equal(t, "event: snapshot", lines[26])
	assert.Empty(t, lines[27])
}

func TestExtension_no_http(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.OutputType = "bar"
	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=-1"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	dashboard, ok := ext.(*extension)

	assert.True(t, ok)

	assert.Equal(t, -1, dashboard.options.Port)
	assert.Equal(t, "bar", ext.Description())

	assert.NoError(t, ext.Stop())
}

func TestExtension_random_port(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.OutputType = "foo"
	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=0"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	dashboard, ok := ext.(*extension)

	assert.True(t, ok)

	assert.Greater(t, dashboard.options.Port, 0)

	assert.Equal(
		t,
		fmt.Sprintf("foo %s", dashboard.options.url()),
		ext.Description(),
	)

	assert.NoError(t, ext.Stop())
}

func TestExtension_error_used_port(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=0"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	dashboard, ok := ext.(*extension)

	assert.True(t, ok)

	params.ConfigArgument = "port=" + strconv.Itoa(dashboard.options.Port)

	ext2, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext2)

	assert.Error(t, ext2.Start())

	assert.NoError(t, ext.Stop())
}

func TestExtension_open(t *testing.T) {
	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "port=0&open"
	params.FS = fsext.NewMemMapFs()

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	t.Setenv("PATH", "")

	assert.NoError(t, ext.Start())
	assert.NoError(t, ext.Stop())
}

func TestExtension_report(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	file, err := osFS.Create("temp")

	assert.NoError(t, err)
	assert.NoError(t, file.Close())

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=-1&report=" + file.Name() + ".gz"
	params.FS = osFS

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	time.Sleep(time.Millisecond)

	go func() {
		sample := testSample(t, "foo", metrics.Counter, 1)

		ext.AddMetricSamples(testSampleContainer(t, sample).toArray())
	}()

	time.Sleep(100 * time.Millisecond)

	assert.NoError(t, ext.Stop())

	st, err := osFS.Stat(file.Name() + ".gz")

	assert.NoError(t, err)

	assert.Greater(t, st.Size(), int64(1024))

	assert.NoError(t, osFS.Remove(file.Name()+".gz"))
}

func TestExtension_skip_report(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	file, err := osFS.Create("temp")

	assert.NoError(t, err)
	assert.NoError(t, file.Close())

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=-1&report=" + file.Name() + ".gz"
	params.FS = osFS

	ext, err := New(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	assert.NoError(t, ext.Stop())

	_, err = osFS.Stat(file.Name() + ".gz")

	assert.Error(t, err)
}

func Test_newParamData(t *testing.T) {
	t.Parallel()

	params := new(output.Params)

	params.ScriptOptions.Scenarios = lib.ScenarioConfigs{
		"foo": nil,
		"bar": nil,
	}

	param := newParamData(params)

	assert.Len(t, param.Scenarios, 2)
	assert.Empty(t, param.ScriptPath)

	params.ScriptOptions.Scenarios = nil

	u, err := url.Parse("file:///tmp/script.js")
	assert.NoError(t, err)

	params.ScriptPath = u

	param = newParamData(params)

	assert.Len(t, param.Scenarios, 0)
	assert.Equal(t, param.ScriptPath, "file:///tmp/script.js")
}

func Test_paramData_With(t *testing.T) {
	t.Parallel()

	param := new(paramData)

	period := time.Hour

	assert.Same(t, param, param.withPeriod(period))

	assert.Equal(t, time.Duration(period.Milliseconds()), param.Period)
	assert.Empty(t, param.EndOffset)

	param = new(paramData)

	assert.Same(t, param, param.withEndOffest(period))
	assert.Equal(t, time.Duration(period.Milliseconds()), param.EndOffset)
	assert.Empty(t, param.Period)

	param = new(paramData)

	thresholds := map[string]metrics.Thresholds{}

	assert.Same(t, param, param.withThresholds(thresholds))
	assert.Nil(t, param.Thresholds)

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

	assert.Same(t, param, param.withThresholds(thresholds))
	assert.Equal(t, []string{"a > 2", "b > 3"}, param.Thresholds["foo"])
	assert.Equal(t, []string{"c > 1", "d > 0"}, param.Thresholds["bar"])
	assert.Len(t, param.Thresholds, 2)

	ext := new(extension)

	ext.param = new(paramData)

	ext.SetThresholds(thresholds)

	assert.Equal(t, param, ext.param)
}

func Test_paramData_withTags(t *testing.T) {
	t.Parallel()

	param := new(paramData)

	assert.Same(t, param, param.withTags([]string{"foo", "bar"}))
	assert.Equal(t, []string{"foo", "bar"}, param.Tags)
}
