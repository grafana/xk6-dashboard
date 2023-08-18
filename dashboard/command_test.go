// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"embed"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_buildRootCmd(t *testing.T) {
	t.Parallel()

	opts := new(options)

	cmd := buildRootCmd(opts, embed.FS{}, embed.FS{})

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

	cmd := buildRootCmd(opts, embed.FS{}, embed.FS{})

	assert.NotNil(t, cmd)

	rep, _, err := cmd.Find([]string{"dashboard", "replay"})

	assert.NoError(t, err)

	err = rep.ParseFlags([]string{"--port", "-1"})

	assert.NoError(t, err)

	err = rep.RunE(rep, []string{"testdata/result.gz"})

	assert.NoError(t, err)
}

func Test_buildRootCmd_reply_error(t *testing.T) {
	t.Parallel()

	opts := new(options)

	cmd := buildRootCmd(opts, embed.FS{}, embed.FS{})

	assert.NotNil(t, cmd)

	rep, _, err := cmd.Find([]string{"dashboard", "replay"})

	assert.NoError(t, err)

	err = rep.ParseFlags([]string{"--port", "-1"})

	assert.NoError(t, err)

	err = rep.RunE(rep, []string{"no such file"})

	assert.Error(t, err)
}
