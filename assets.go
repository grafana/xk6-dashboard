// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"embed"
	"io/fs"
)

//go:embed assets/packages/ui/dist assets/packages/brief/dist assets/packages/config/dist
var distFS embed.FS

const base = "assets/packages/"

func dirUI() fs.FS {
	return dir(base + "ui/dist")
}

func dirBrief() fs.FS {
	return dir(base + "brief/dist")
}

func fileConfig() []byte {
	config, err := distFS.ReadFile(base + "config/dist/config.json")
	if err != nil {
		panic(err)
	}

	return config
}

func dir(dirname string) fs.FS {
	subfs, err := fs.Sub(distFS, dirname)
	if err != nil {
		panic(err)
	}

	return subfs
}
