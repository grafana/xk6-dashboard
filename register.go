// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"github.com/szkiba/xk6-dashboard/assets"
	"github.com/szkiba/xk6-dashboard/dashboard"
	"go.k6.io/k6/output"
)

func init() {
	register()
}

func register() {
	output.RegisterExtension("dashboard", ctor)
}

func ctor(params output.Params) (output.Output, error) { //nolint:ireturn
	return dashboard.New(params, assets.DirUI(), assets.DirBrief())
}
