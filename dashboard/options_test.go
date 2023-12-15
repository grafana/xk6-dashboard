// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"fmt"
	"net"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func Test_getopts_defaults(t *testing.T) {
	t.Parallel()

	opts, err := getopts("", nil)

	assert.NoError(t, err)
	assert.NotNil(t, opts)

	assert.Equal(t, defaultHost, opts.Host)
	assert.Equal(t, defaultPort, opts.Port)
	assert.Equal(t, defaultPeriod, opts.Period)
	assert.Equal(t, defaultOpen, opts.Open)
	assert.Equal(t, defaultExport, opts.Export)
	assert.Equal(t, defaultTags(), opts.Tags)

	assert.Equal(
		t,
		fmt.Sprintf("http://%s", net.JoinHostPort("127.0.0.1", strconv.Itoa(defaultPort))),
		opts.url(),
	)
}

func Test_getopts_error(t *testing.T) {
	t.Parallel()

	_, err := getopts("period=s", nil)

	assert.Error(t, err)
}

func Test_getopts_env(t *testing.T) {
	t.Parallel()

	env := map[string]string{
		envPort:   "1",
		envHost:   "example.com",
		envPeriod: "1h",
		envRecord: "results.data",
		envExport: "report.html",
		envTags:   "foo,bar",
		envOpen:   "true",
	}

	opts, err := getopts("", env)

	assert.NoError(t, err)
	assert.NotNil(t, opts)

	assert.Equal(t, "example.com", opts.Host)
	assert.Equal(t, 1, opts.Port)
	assert.Equal(t, time.Hour, opts.Period)
	assert.Equal(t, true, opts.Open)
	assert.Equal(t, "report.html", opts.Export)
	assert.Equal(t, []string{"foo", "bar"}, opts.Tags)

	assert.Equal(t, "http://example.com:1", opts.url())
}

func Test_getopts(t *testing.T) {
	t.Parallel()

	env := map[string]string{
		envPort:   "6666",
		envHost:   "example.net",
		envPeriod: "2h",
		envRecord: "results.data",
		envExport: "final.html",
		envTags:   "foo,bar",
		envOpen:   "true",
	}

	opts, err := getopts(
		"period=1s&port=1&host=localhost&open&export=report.html&tag=foo&tag=bar",
		env,
	)

	assert.NoError(t, err)
	assert.Equal(t, time.Second, opts.Period)
	assert.Equal(t, 1, opts.Port)
	assert.True(t, opts.Open)
	assert.Equal(t, "report.html", opts.Export)
	assert.Equal(t, "localhost", opts.Host)
	assert.Equal(t, "http://localhost:1", opts.url())
	assert.Equal(t, "localhost:1", opts.addr())
	assert.Equal(t, []string{"foo", "bar"}, opts.Tags)

	opts, err = getopts("tag=foo&tag=bar&tags=apple,orange", nil)

	assert.NoError(t, err)
	assert.Equal(t, []string{"foo", "bar", "apple", "orange"}, opts.Tags)
}

func Test_options_pack_calc(t *testing.T) {
	t.Parallel()

	opts, _ := getopts("period=1s", nil)

	assert.Equal(t, time.Second, opts.period(0))

	assert.Equal(t, time.Second, opts.period(points*time.Second))
	assert.Equal(t, 2*time.Second, opts.period(2*points*time.Second))
	assert.Equal(t, 3*time.Second, opts.period(3*points*time.Second))

	opts, _ = getopts("", nil)

	assert.Equal(t, 10*time.Second, opts.period(time.Second))
	assert.Equal(t, 10*time.Second, opts.period(4*time.Hour))
	assert.Equal(t, 10*time.Second, opts.period(8*time.Hour))
	assert.Equal(t, 20*time.Second, opts.period(9*time.Hour))
	assert.Equal(t, 20*time.Second, opts.period(16*time.Hour))
	assert.Equal(t, 30*time.Second, opts.period(24*time.Hour))
}

func Test_options_addr(t *testing.T) {
	t.Parallel()

	opts := new(options)

	assert.Equal(t, ":0", opts.addr())

	opts.Port = -1

	assert.Equal(t, "", opts.addr())
}

func Test_options_url(t *testing.T) {
	t.Parallel()

	opts := new(options)

	assert.Equal(t, "http://127.0.0.1:0", opts.url())

	opts.Port = -1

	assert.Equal(t, "", opts.url())
}
