// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/output"
)

func TestRegister(t *testing.T) {
	t.Parallel()

	assert.Panics(t, register) // already registered
}

func Test_ctor(t *testing.T) {
	t.Parallel()

	var params output.Params

	ext, err := ctor(params)

	assert.NoError(t, err)
	assert.NotNil(t, ext)
}
