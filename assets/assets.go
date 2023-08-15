// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package assets

import (
	"embed"
	"io/fs"
)

//go:embed ui brief
var distFS embed.FS

func DirUI() fs.FS {
	return dir("ui")
}

func DirBrief() fs.FS {
	return dir("brief")
}

func dir(dirname string) fs.FS {
	subfs, err := fs.Sub(distFS, dirname)
	if err != nil {
		panic(err)
	}

	return subfs
}
