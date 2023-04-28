// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"embed"
	"io/fs"

	"github.com/szkiba/xk6-dashboard/dashboard"
	"go.k6.io/k6/output"
)

const distDir = "assets/ui/dist"

//go:embed assets/ui/dist
var distFS embed.FS

func init() {
	register()
}

func register() {
	output.RegisterExtension("dashboard", ctor)
}

func ctor(params output.Params) (output.Output, error) { //nolint:ireturn
	uiFS, err := fs.Sub(distFS, distDir)
	if err != nil {
		return nil, err
	}

	return dashboard.New(params, uiFS)
}
