// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const (
	testdataEvents     = 25
	linePerEvent       = 4
	testdataEventLines = testdataEvents * linePerEvent
)

func Test_replay(t *testing.T) {
	t.Parallel()

	opts := &options{
		Port:   0,
		Host:   "127.0.0.1",
		Period: time.Second,
		Open:   false,
		Export: "",
		Tags:   nil,
		TagsS:  "",
	}

	th := helper(t).osFs()

	assert.NoError(t, replay("testdata/result.ndjson", opts, th.assets, th.proc))

	lines := readSSE(t, testdataEventLines, "http://"+opts.addr()+"/events")

	assert.Equal(t, testdataEventLines, len(lines))
}

func Test_replay_gz(t *testing.T) {
	t.Parallel()

	opts := &options{
		Port:   0,
		Host:   "127.0.0.1",
		Period: time.Second,
		Open:   false,
		Export: "",
		Tags:   nil,
		TagsS:  "",
	}

	th := helper(t).osFs()

	assert.NoError(t, replay("testdata/result.ndjson.gz", opts, th.assets, th.proc))

	lines := readSSE(t, testdataEventLines, "http://"+opts.addr()+"/events")

	assert.Equal(t, testdataEventLines, len(lines))
}

func Test_replay_open(t *testing.T) {
	opts := &options{
		Port:   0,
		Host:   "127.0.0.1",
		Period: time.Second,
		Open:   true,
		Export: "",
		Tags:   nil,
		TagsS:  "",
	}

	t.Setenv("PATH", "")

	th := helper(t).osFs()

	assert.NoError(t, replay("testdata/result.ndjson.gz", opts, th.assets, th.proc))

	assert.Greater(t, opts.Port, 0) // side effect, but no better way currently...
}

func Test_replay_error_port_used(t *testing.T) { //nolint:paralleltest
	opts := &options{
		Port:   0,
		Host:   "127.0.0.1",
		Period: time.Second,
		Open:   false,
		Export: "",
		Tags:   nil,
		TagsS:  "",
	}

	th := helper(t).osFs()

	assert.NoError(t, replay("testdata/result.ndjson.gz", opts, th.assets, th.proc))
	assert.Error(t, replay("testdata/result.ndjson.gz", opts, th.assets, th.proc))
}

func Test_replay_export(t *testing.T) {
	t.Parallel()

	export := filepath.Join(t.TempDir(), "report.html")

	opts := &options{
		Port:   -1,
		Host:   "",
		Period: time.Second,
		Open:   false,
		Export: export,
		Tags:   nil,
		TagsS:  "",
	}

	th := helper(t).osFs()

	assert.NoError(t, replay("testdata/result.ndjson.gz", opts, th.assets, th.proc))

	st, err := th.proc.fs.Stat(export)

	assert.NoError(t, err)

	assert.Greater(t, st.Size(), int64(1024))
}
