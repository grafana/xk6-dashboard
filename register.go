// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

// Package dashboard contains the assembly and registration of the output extension.
package dashboard

import (
	"github.com/grafana/xk6-dashboard/dashboard"
	"go.k6.io/k6/output"
)

const outputName = "dashboard"

func init() {
	output.RegisterExtension(outputName, dashboard.New)
}
