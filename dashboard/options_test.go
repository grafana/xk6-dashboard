// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"net"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func Test_getopts_defaults(t *testing.T) {
	t.Parallel()

	opts, err := getopts("", nil)

	require.NoError(t, err)
	require.NotNil(t, opts)

	require.Equal(t, defaultHost, opts.Host)
	require.Equal(t, defaultPort, opts.Port)
	require.Equal(t, defaultPeriod, opts.Period)
	require.Equal(t, defaultOpen, opts.Open)
	require.Equal(t, defaultExport, opts.Export)
	require.Equal(t, defaultTags(), opts.Tags)

	require.Equal(
		t,
		"http://"+net.JoinHostPort("127.0.0.1", strconv.Itoa(defaultPort)),
		opts.url(),
	)
}

func Test_getopts_error(t *testing.T) {
	t.Parallel()

	_, err := getopts("period=s", nil)

	require.Error(t, err)
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

	require.NoError(t, err)
	require.NotNil(t, opts)

	require.Equal(t, "example.com", opts.Host)
	require.Equal(t, 1, opts.Port)
	require.Equal(t, time.Hour, opts.Period)
	require.True(t, opts.Open)
	require.Equal(t, "report.html", opts.Export)
	require.Equal(t, []string{"foo", "bar"}, opts.Tags)

	require.Equal(t, "http://example.com:1", opts.url())
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

	require.NoError(t, err)
	require.Equal(t, time.Second, opts.Period)
	require.Equal(t, 1, opts.Port)
	require.True(t, opts.Open)
	require.Equal(t, "report.html", opts.Export)
	require.Equal(t, "localhost", opts.Host)
	require.Equal(t, "http://localhost:1", opts.url())
	require.Equal(t, "localhost:1", opts.addr())
	require.Equal(t, []string{"foo", "bar"}, opts.Tags)

	opts, err = getopts("tag=foo&tag=bar&tags=apple,orange", nil)

	require.NoError(t, err)
	require.Equal(t, []string{"foo", "bar", "apple", "orange"}, opts.Tags)
}

func Test_options_pack_calc(t *testing.T) {
	t.Parallel()

	opts, _ := getopts("period=1s", nil)

	require.Equal(t, time.Second, opts.period(0))

	require.Equal(t, time.Second, opts.period(points*time.Second))
	require.Equal(t, 2*time.Second, opts.period(2*points*time.Second))
	require.Equal(t, 3*time.Second, opts.period(3*points*time.Second))

	opts, _ = getopts("", nil)

	require.Equal(t, 10*time.Second, opts.period(time.Second))
	require.Equal(t, 10*time.Second, opts.period(4*time.Hour))
	require.Equal(t, 10*time.Second, opts.period(8*time.Hour))
	require.Equal(t, 20*time.Second, opts.period(9*time.Hour))
	require.Equal(t, 20*time.Second, opts.period(16*time.Hour))
	require.Equal(t, 30*time.Second, opts.period(24*time.Hour))
}

func Test_options_addr(t *testing.T) {
	t.Parallel()

	opts := new(options)

	require.Equal(t, ":0", opts.addr())

	opts.Port = -1

	require.Empty(t, opts.addr())
}

func Test_options_url(t *testing.T) {
	t.Parallel()

	opts := new(options)

	require.Equal(t, "http://127.0.0.1:0", opts.url())

	opts.Port = -1

	require.Empty(t, opts.url())
}
