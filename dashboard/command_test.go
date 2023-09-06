// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"context"
	"embed"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/cmd/state"
)

func Test_buildRootCmd(t *testing.T) {
	t.Parallel()

	opts := new(options)

	gs := state.NewGlobalState(context.Background())

	cmd := buildRootCmd(opts, testConfig(t), embed.FS{}, embed.FS{}, gs)

	assert.NotNil(t, cmd)

	rep, _, err := cmd.Find([]string{"dashboard", "replay"})

	assert.NoError(t, err)
	assert.NotNil(t, rep)

	assert.Equal(t, "replay", rep.Name())

	err = rep.ParseFlags([]string{})

	assert.NoError(t, err)

	assert.Equal(t, defaultHost, rep.Flag("host").Value.String())
	assert.Equal(t, strconv.Itoa(defaultPort), rep.Flag("port").Value.String())
}

func Test_buildRootCmd_reply(t *testing.T) {
	t.Parallel()

	opts := new(options)

	gs := state.NewGlobalState(context.Background())

	cmd := buildRootCmd(opts, testConfig(t), embed.FS{}, embed.FS{}, gs)

	assert.NotNil(t, cmd)

	rep, _, err := cmd.Find([]string{"dashboard", "replay"})

	assert.NoError(t, err)

	err = rep.ParseFlags([]string{"--port", "-1"})

	assert.NoError(t, err)

	err = rep.RunE(rep, []string{"testdata/result.json.gz"})

	assert.NoError(t, err)
}

func Test_buildRootCmd_reply_error(t *testing.T) {
	t.Parallel()

	opts := new(options)

	gs := state.NewGlobalState(context.Background())

	cmd := buildRootCmd(opts, testConfig(t), embed.FS{}, embed.FS{}, gs)

	assert.NotNil(t, cmd)

	rep, _, err := cmd.Find([]string{"dashboard", "replay"})

	assert.NoError(t, err)

	err = rep.ParseFlags([]string{"--port", "-1"})

	assert.NoError(t, err)

	err = rep.RunE(rep, []string{"no such file"})

	assert.Error(t, err)
}
