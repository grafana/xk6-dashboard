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

const name = "dashboard"

func init() {
	gs := state.NewGlobalState(context.Background())

	if len(gs.CmdArgs) > 1 && gs.CmdArgs[1] == name {
		execute(gs)
	}

	register()
}

func register() {
	output.RegisterExtension(name, dashboard.New)
}

func execute(gs *state.GlobalState) {
	if err := dashboard.NewCommand(gs).Execute(); err != nil {
		gs.Logger.Error(err)
		gs.OSExit(1)
	}

	gs.OSExit(0)
}
