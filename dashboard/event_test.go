// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type errorEventListener struct{}

func (*errorEventListener) onEvent(string, interface{}) {}

func (*errorEventListener) onStart() error {
	return assert.AnError
}

func (*errorEventListener) onStop(_ error) error {
	return assert.AnError
}

func Test_eventSource_error(t *testing.T) {
	t.Parallel()

	src := new(eventSource)

	src.addEventListener(new(errorEventListener))

	require.Error(t, src.fireStart())
	require.Error(t, src.fireStop(nil))
}
