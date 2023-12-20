// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

// Package cmd contains CLI tool's root command definition.
package cmd

import (
	"context"
	"strings"

	"github.com/grafana/xk6-dashboard/dashboard"
	"github.com/spf13/cobra"
	"go.k6.io/k6/cmd/state"
)

//nolint:gochecknoglobals
var (
	appname = "k6-web-dashboard" // set by goreleaser
	version = "dev"              // set by goreleaser
)

// NewRootCommand build k6-web-dashboard command.
func NewRootCommand() *cobra.Command {
	cmd := dashboard.NewCommand(state.NewGlobalState(context.TODO()))
	cmd.Use = strings.ReplaceAll(cmd.Use, dashboard.OutputName, appname)
	cmd.Short = strings.ReplaceAll(cmd.Short, dashboard.OutputName, appname)
	cmd.Long = strings.ReplaceAll(cmd.Long, "k6 "+dashboard.OutputName, appname)
	cmd.Version = version
	cmd.DisableAutoGenTag = true

	for _, c := range cmd.Commands() {
		c.Example = strings.ReplaceAll(c.Example, "k6 "+dashboard.OutputName, appname)
	}

	return cmd
}
