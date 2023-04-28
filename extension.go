// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"embed"
	"io/fs"

	"github.com/szkiba/xk6-dashboard/internal"
	"go.k6.io/k6/output"
)

const distDir = "assets/ui/dist"

//go:embed assets/ui/dist
var distFS embed.FS

// Register the extensions on module initialization.
func init() {
	output.RegisterExtension("dashboard", New)
}

func New(params output.Params) (output.Output, error) { //nolint:ireturn
	uiFS, err := fs.Sub(distFS, distDir)
	if err != nil {
		return nil, err
	}

	return internal.NewDashboard(params, uiFS)
}
