// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"

	"github.com/stretchr/testify/require"
	"go.k6.io/k6/metrics"
)

func Test_newRegistry(t *testing.T) {
	t.Parallel()

	reg := newRegistry()

	require.NotNil(t, reg)
	require.NotNil(t, reg.Registry)
	require.NotNil(t, reg.names)
}

func Test_registry_getOrNew(t *testing.T) {
	t.Parallel()

	reg := newRegistry()

	met, err := reg.getOrNew("foo", metrics.Counter, metrics.Data, nil)

	require.NoError(t, err)
	require.NotNil(t, met)
	require.Equal(t, []string{"foo"}, reg.names)

	met2, err := reg.getOrNew("foo", metrics.Counter, metrics.Data, nil)

	require.NoError(t, err)
	require.NotNil(t, met)
	require.Same(t, met, met2)
	require.Equal(t, []string{"foo"}, reg.names)

	met3, err := reg.getOrNew("bar", metrics.Counter, metrics.Data, nil)

	require.NoError(t, err)
	require.NotNil(t, met3)
	require.Equal(t, []string{"foo", "bar"}, reg.names)

	_, err = reg.getOrNew("", metrics.Counter, metrics.Data, nil)

	require.Error(t, err)

	require.Panics(t, func() { reg.mustGetOrNew("", metrics.Counter, metrics.Data, nil) })
}
