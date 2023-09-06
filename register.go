// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

// Package dashboard contains the assembly and registration of the output extension.
package dashboard

import (
	"context"

	"github.com/grafana/xk6-dashboard/dashboard"
	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/output"
)

func init() {
	gs := state.NewGlobalState(context.Background())

	if len(gs.CmdArgs) > 1 && gs.CmdArgs[1] == "dashboard" {
		dashboard.Execute(gs, fileConfig(), dirUI(), dirBrief())
	}

	register()
}

func register() {
	output.RegisterExtension("dashboard", ctor)
}

func ctor(params output.Params) (output.Output, error) { //nolint:ireturn
	return dashboard.New(params, fileConfig(), dirUI(), dirBrief())
}
