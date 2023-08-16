// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"os"

	"github.com/szkiba/xk6-dashboard/assets"
	"github.com/szkiba/xk6-dashboard/dashboard"
)

func init() {
	if len(os.Args) == 1 || os.Args[1] != "dashboard" {
		return
	}

	dashboard.Execute(assets.DirUI(), assets.DirBrief())
}
