// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

//go:build mage

package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
	"github.com/princjef/mageutil/bintool"
)

var (
	bindir  string
	workdir string
	module  string
)

func init() {
	cwd, err := os.Getwd()
	must(err)

	workdir = filepath.Join(cwd, "build")
	bindir = filepath.Join(workdir, ".bin")

	os.MkdirAll(bindir, 0o755)
	os.MkdirAll(workdir, 0o755)

	path := fmt.Sprintf("%s%c%s", bindir, os.PathListSeparator, os.Getenv("PATH"))
	os.Setenv("PATH", path)

	mod, err := os.ReadFile("go.mod")
	must(err)

	module = string(mod[7:bytes.IndexRune(mod, '\n')])
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func exists(filename string) bool {
	if _, err := os.Stat(filename); errors.Is(err, os.ErrNotExist) {
		return false
	}

	return true
}

func goinstall(target string) error {
	return sh.RunWith(map[string]string{"GOBIN": bindir}, "go", "install", target)
}

func hasAssets() bool {
	if _, err := exec.LookPath("yarn"); err != nil {
		return false
	}

	return exists(filepath.Join(assetsdir, "package.json"))
}

// tools downloads k6 golangci-lint configuration, golangci-lint and xk6 binary.
func tools() error {
	resp, err := http.Get("https://raw.githubusercontent.com/grafana/k6/master/.golangci.yml")
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return errors.New("failed to download linter configuration")
	}

	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	err = os.WriteFile(".golangci.yml", content, 0o644)
	if err != nil {
		return err
	}

	if !bytes.HasPrefix(content, []byte("# v")) {
		return errors.New("missing version comment")
	}

	version := strings.TrimSpace(string(content[3:bytes.IndexRune(content, '\n')]))

	linter, err := bintool.New(
		"golangci-lint{{.BinExt}}",
		version,
		"https://github.com/golangci/golangci-lint/releases/download/v{{.Version}}/golangci-lint-{{.Version}}-{{.GOOS}}-{{.GOARCH}}{{.ArchiveExt}}",
		bintool.WithFolder(bindir),
	)
	if err != nil {
		return err
	}

	if linter.IsInstalled() {
		return nil
	}

	xk6, err := bintool.NewGo("go.k6.io/xk6/cmd/xk6", "latest", bintool.WithFolder(bindir))
	if err != nil {
		return err
	}

	if err := xk6.Ensure(); err != nil {
		return err
	}

	return linter.Ensure()
}

func xk6build() error {
	mg.Deps(tools)

	return sh.Run("xk6", "build", "--with", module+"=.")
}

func xk6run(args ...string) error {
	mg.Deps(tools)

	fix := []string{"run", "--quiet", "--no-summary", "--no-usage-report"}
	return sh.Run("xk6", append(fix, args...)...)
}

func lint() error {
	mg.Deps(tools)

	_, err := sh.Exec(nil, os.Stdout, os.Stderr, "golangci-lint", "run")
	if err != nil {
		return err
	}

	return nil
}

func generate() error {
	mg.Deps(tools)

	if err := sh.Run("go", "generate", "./..."); err != nil {
		return err
	}

	if hasAssets() {
		if err := sh.Run("yarn", "--silent", "--cwd", assetsdir, "install"); err != nil {
			return err
		}

		if err := sh.Run("yarn", "--silent", "--cwd", assetsdir, "build"); err != nil {
			return err
		}
	}

	return nil
}

func coverprofile() string {
	return filepath.Join(workdir, "coverage.txt")
}

func test() error {
	maxproc := "4"

	if runtime.GOOS == "windows" {
		maxproc = "1"
	}

	env := map[string]string{
		"GOMAXPROCS": maxproc,
	}

	_, err := sh.Exec(
		env,
		os.Stdout,
		os.Stderr,
		"go",
		"test",
		"-count",
		"1",
		"-p",
		maxproc,
		"-race",
		"-coverprofile="+coverprofile(),
		"./...",
	)

	return err
}

func cover() error {
	mg.Deps(test)
	_, err := sh.Exec(nil, os.Stdout, os.Stderr, "go", "tool", "cover", "-html="+coverprofile())
	return err
}

func clean() error {
	sh.Rm("build")
	sh.Rm(".bin")
	sh.Rm("k6")
	sh.Rm(filepath.Join(assetsdir, "node_modules"))

	if hasAssets() {
		dirs, err := filepath.Glob(filepath.Join(assetsdir, "packages/*/node_modules"))
		if err == nil {
			for _, file := range dirs {
				sh.Rm(file)
			}
		}
	}

	return nil
}

var assetsdir = filepath.Join("dashboard", "assets")
