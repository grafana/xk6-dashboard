// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"os"

	"github.com/grafana/xk6-dashboard/customize"
	"github.com/grafana/xk6-dashboard/dashboard"
	"go.k6.io/k6/output"
)

func init() {
	dashboard.Customize = customize.Customize

	if len(os.Args) > 1 && os.Args[1] == "dashboard" {
		dashboard.Execute(fileConfig(), dirUI(), dirBrief())
	}

	register()
}

func register() {
	output.RegisterExtension("dashboard", ctor)
}

func ctor(params output.Params) (output.Output, error) { //nolint:ireturn
	return dashboard.New(params, fileConfig(), dirUI(), dirBrief())
}
