// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/lib/consts"
)

// Execute executes dashboard command.
func Execute(gs *state.GlobalState, uiConfig json.RawMessage, uiFS fs.FS, briefFS fs.FS) {
	opts := new(options)

	if err := buildRootCmd(opts, uiConfig, uiFS, briefFS, gs).Execute(); err != nil {
		fmt.Fprintln(gs.Stderr, err)
		gs.OSExit(1)
	}

	gs.OSExit(0)
}

const (
	flagHost   = "host"
	flagPort   = "port"
	flagPeriod = "period"
	flagOpen   = "open"
	flagReport = "report"
	flagTags   = "tags"

	typeMetric = "Metric"
	typePoint  = "Point"
)

func buildRootCmd(
	opts *options,
	uiConfig json.RawMessage,
	uiFS fs.FS,
	briefFS fs.FS,
	gs *state.GlobalState,
) *cobra.Command {
	rootCmd := &cobra.Command{ //nolint:exhaustruct
		Use:   "k6",
		Short: "a next-generation load generator",
		Long:  "\n" + consts.Banner(),
	}

	dashboardCmd := &cobra.Command{ //nolint:exhaustruct
		Use:   "dashboard",
		Short: "xk6-dashboard commands",
	}

	rootCmd.AddCommand(dashboardCmd)

	replayCmd := &cobra.Command{ //nolint:exhaustruct
		Use:   "replay file",
		Short: "load the saved JSON results and replay it for the dashboard UI",
		Long: `The replay command load the saved JSON results and replay it for the dashboard UI.
The compressed file will be automatically decompressed if the file extension is .gz`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := replay(opts, uiConfig, uiFS, briefFS, args[0], gs.FS); err != nil {
				return err
			}

			if opts.Port < 0 {
				return nil
			}

			done := make(chan os.Signal, 1)

			signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)

			<-done

			return nil
		},
	}

	replayCmd.Flags().SortFlags = false

	flags := replayCmd.PersistentFlags()

	opts = new(options)

	defineFlags(opts, flags)

	dashboardCmd.AddCommand(replayCmd)

	return rootCmd
}

func defineFlags(opts *options, flags *pflag.FlagSet) {
	flags.StringVar(
		&opts.Host,
		flagHost,
		defaultHost,
		"Hostname or IP address for HTTP endpoint (default: '', empty, listen on all interfaces)",
	)
	flags.IntVar(
		&opts.Port,
		flagPort,
		defaultPort,
		"TCP port for HTTP endpoint (0=random, -1=no HTTP), example: 8080",
	)
	flags.DurationVar(
		&opts.Period,
		flagPeriod,
		defaultPeriod,
		"Event emitting frequency, example: `1m`",
	)
	flags.BoolVar(&opts.Open, flagOpen, defaultOpen, "Open browser window automatically")
	flags.StringVar(
		&opts.Report,
		flagReport,
		defaultReport,
		"Report file location (default: '', no report)",
	)
	flags.StringSliceVar(
		&opts.Tags,
		flagTags,
		defaultTags(),
		"Precomputed metric tags, can be specified more than once",
	)
}
