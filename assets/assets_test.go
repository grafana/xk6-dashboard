// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package assets

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDirUI(t *testing.T) {
	t.Parallel()

	fs := DirUI()

	assert.NotNil(t, fs)

	file, err := fs.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())
}

func TestDirBrief(t *testing.T) {
	t.Parallel()

	fs := DirBrief()

	assert.NotNil(t, fs)

	file, err := fs.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())
}
