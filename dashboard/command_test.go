// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"context"
	"path/filepath"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/cmd/state"
)

func TestNewCommand(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	assert.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"replay"})

	assert.NoError(t, err)
	assert.NotNil(t, sub)

	assert.Equal(t, "replay", sub.Name())

	err = sub.ParseFlags([]string{})

	assert.NoError(t, err)

	assert.Equal(t, defaultHost, sub.Flag("host").Value.String())
	assert.Equal(t, strconv.Itoa(defaultPort), sub.Flag("port").Value.String())
}

func TestNewCommand_reply(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	assert.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"replay"})

	assert.NoError(t, err)

	err = sub.ParseFlags([]string{"--port", "-1"})

	assert.NoError(t, err)

	err = sub.RunE(sub, []string{"testdata/result.json.gz"})

	assert.NoError(t, err)
}

func TestNewCommand_reply_error(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	assert.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"replay"})

	assert.NoError(t, err)

	err = sub.ParseFlags([]string{"--port", "-1"})

	assert.NoError(t, err)

	err = sub.RunE(sub, []string{"no such file"})

	assert.Error(t, err)
}

func TestNewCommand_report(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	assert.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"report"})

	assert.NoError(t, err)

	out := filepath.Join(t.TempDir(), "report.html")

	err = sub.RunE(sub, []string{"testdata/result.ndjson.gz", out})

	assert.NoError(t, err)
}

func TestNewCommand_aggregate(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	assert.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"aggregate"})

	assert.NoError(t, err)

	out := filepath.Join(t.TempDir(), "result.ndjson")

	err = sub.RunE(sub, []string{"testdata/result.json.gz", out})

	assert.NoError(t, err)
}
