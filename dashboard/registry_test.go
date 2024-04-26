// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/metrics"
)

func Test_newRegistry(t *testing.T) {
	t.Parallel()

	reg := newRegistry()

	assert.NotNil(t, reg)
	assert.NotNil(t, reg.Registry)
	assert.NotNil(t, reg.names)
}

func Test_registry_getOrNew(t *testing.T) {
	t.Parallel()

	reg := newRegistry()

	met, err := reg.getOrNew("foo", metrics.Counter, metrics.Data, nil)

	assert.NoError(t, err)
	assert.NotNil(t, met)
	assert.Equal(t, []string{"foo"}, reg.names)

	met2, err := reg.getOrNew("foo", metrics.Counter, metrics.Data, nil)

	assert.NoError(t, err)
	assert.NotNil(t, met)
	assert.Same(t, met, met2)
	assert.Equal(t, []string{"foo"}, reg.names)

	met3, err := reg.getOrNew("bar", metrics.Counter, metrics.Data, nil)

	assert.NoError(t, err)
	assert.NotNil(t, met3)
	assert.Equal(t, []string{"foo", "bar"}, reg.names)

	_, err = reg.getOrNew("", metrics.Counter, metrics.Data, nil)

	assert.Error(t, err)

	assert.Panics(t, func() { reg.mustGetOrNew("", metrics.Counter, metrics.Data, nil) })
}
