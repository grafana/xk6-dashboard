// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_dir(t *testing.T) {
	t.Parallel()

	fs := dir("hu")

	assert.NotNil(t, fs)
	assert.Panics(t, func() {
		dir("..") //nolint:errcheck
	})
}

func Test_dirUI(t *testing.T) {
	t.Parallel()

	fs := dirUI()

	assert.NotNil(t, fs)

	file, err := fs.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())
}

func Test_dirBrief(t *testing.T) {
	t.Parallel()

	fs := dirBrief()

	assert.NotNil(t, fs)

	file, err := fs.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())
}

func Test_fileConfig(t *testing.T) {
	t.Parallel()

	binary := fileConfig()

	assert.NotNil(t, binary)

	conf := map[string]interface{}{}

	assert.NoError(t, json.Unmarshal(binary, &conf))
}
