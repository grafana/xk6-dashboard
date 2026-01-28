// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

// Package dashboard contains the assembly and registration of the output extension.
package dashboard

import (
	"strings"

	"github.com/grafana/xk6-dashboard/dashboard"
	"github.com/spf13/cobra"
	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/output"
	"go.k6.io/k6/subcommand"
)

const outputName = "dashboard"

func init() {
	output.RegisterExtension(outputName, dashboard.New)
	subcommand.RegisterExtension("dashboard", newCommand)
}

// newCommand creates the `dashboard` sub-command.
// This is required because dashboard.NewCommand uses dashboard.OutputName as the command name,
// but we want to use "dashboard" as the command name in the CLI. The dashboard.OutputName is kept
// for embedding into k6 as a subcommand.
func newCommand(gs *state.GlobalState) *cobra.Command {
	cmd := dashboard.NewCommand(gs)

	cmd.Use = strings.ReplaceAll(cmd.Use, dashboard.OutputName, outputName)

	return cmd
}
