// Package main contains a build-time documentation generation tool.
// This tool generates the README.md file based on the CLI help.
package main

// The go.work workaround is needed to avoid having to upgrade the cobra dependency version in k6.

import (
	"github.com/grafana/xk6-dashboard/cmd"
	"github.com/spf13/cobra"
	"github.com/szkiba/docsme"
)

func main() {
	cobra.CheckErr(docsme.For(cmd.NewRootCommand()).Execute())
}
