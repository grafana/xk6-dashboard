// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

// Package main contains web-dashboard CLI tool.
package main

import (
	"github.com/grafana/xk6-dashboard/cmd"
	"github.com/spf13/cobra"
)

func main() {
	cmd := cmd.NewRootCommand()
	cobra.CheckErr(cmd.Execute())
}
