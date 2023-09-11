// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bufio"
	"compress/gzip"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func Test_aggregate(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()
	out := filepath.Join(t.TempDir(), "out.ndjson")

	opts := &options{
		Tags:   defaultTags(),
		Period: 2 * time.Second,
	}

	err := aggregate("testdata/result.json", out, opts, th.proc)

	assert.NoError(t, err)

	file, err := th.proc.fs.Open(out)

	assert.NoError(t, err)

	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)

	var lines []string

	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	assert.NoError(t, file.Close())

	// last 2 event (snapshot, cumulative) depends on time relations...
	assert.LessOrEqual(t, testdataEvents-2, len(lines))
	assert.GreaterOrEqual(t, testdataEvents, len(lines))
}

func Test_aggregate_gzip(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()
	out := filepath.Join(t.TempDir(), "out.ndjson.gz")

	opts := &options{
		Tags:   defaultTags(),
		Period: 2 * time.Second,
	}

	err := aggregate("testdata/result.json.gz", out, opts, th.proc)

	assert.NoError(t, err)

	file, err := th.proc.fs.Open(out)

	assert.NoError(t, err)

	reader, err := gzip.NewReader(file)

	assert.NoError(t, err)

	scanner := bufio.NewScanner(reader)
	scanner.Split(bufio.ScanLines)

	var lines []string

	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	assert.NoError(t, reader.Close())
	assert.NoError(t, file.Close())

	// last 2 event (snapshot, cumulative) depends on time relations...
	assert.LessOrEqual(t, testdataEvents-2, len(lines))
	assert.GreaterOrEqual(t, testdataEvents, len(lines))
}
