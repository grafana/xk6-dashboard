// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"testing"

	"github.com/grafana/xk6-dashboard/dashboard"
	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/output"
)

func TestRegister(t *testing.T) {
	t.Parallel()

	assert.Panics(t, func() {
		output.RegisterExtension(outputName, dashboard.New)
	}) // already registered
}
