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

	"github.com/stretchr/testify/require"
	"go.k6.io/k6/cmd/state"
)

func TestNewCommand(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	require.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"replay"})

	require.NoError(t, err)
	require.NotNil(t, sub)

	require.Equal(t, "replay", sub.Name())

	err = sub.ParseFlags([]string{})

	require.NoError(t, err)

	require.Equal(t, defaultHost, sub.Flag("host").Value.String())
	require.Equal(t, strconv.Itoa(defaultPort), sub.Flag("port").Value.String())
}

func TestNewCommand_reply(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	require.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"replay"})

	require.NoError(t, err)

	err = sub.ParseFlags([]string{"--port", "-1"})

	require.NoError(t, err)

	err = sub.RunE(sub, []string{"testdata/result.json.gz"})

	require.NoError(t, err)
}

func TestNewCommand_reply_error(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	require.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"replay"})

	require.NoError(t, err)

	err = sub.ParseFlags([]string{"--port", "-1"})

	require.NoError(t, err)

	err = sub.RunE(sub, []string{"no such file"})

	require.Error(t, err)
}

func TestNewCommand_report(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	require.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"report"})

	require.NoError(t, err)

	out := filepath.Join(t.TempDir(), "report.html")

	err = sub.RunE(sub, []string{"testdata/result.ndjson.gz", out})

	require.NoError(t, err)
}

func TestNewCommand_aggregate(t *testing.T) {
	t.Parallel()

	gs := state.NewGlobalState(context.Background())

	cmd := NewCommand(gs)

	require.NotNil(t, cmd)

	sub, _, err := cmd.Find([]string{"aggregate"})

	require.NoError(t, err)

	out := filepath.Join(t.TempDir(), "result.ndjson")

	err = sub.RunE(sub, []string{"testdata/result.json.gz", out})

	require.NoError(t, err)
}
