// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

//go:build mage

package main

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"github.com/grafana/xk6-dashboard/cmd"
	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
	"github.com/princjef/mageutil/shellcmd"
	"github.com/spf13/cobra/doc"
)

// download required build tools
func Tools() error {
	return tools()
}

// run the golangci-lint linter
func Lint() error {
	return lint()
}

// Build build the k6 binary
func Build() error {
	return xk6build()
}

// Generate generate go sources and assets
func Generate() error {
	return generate()
}

// run tests
func Test() error {
	return test()
}

// show HTML coverage report
func Cover() error {
	return cover()
}

// remove temporary build files
func Clean() error {
	return clean()
}

// lint, test, build
func All() error {
	if err := Lint(); err != nil {
		return err
	}

	if err := Test(); err != nil {
		return err
	}

	return Build()
}

// generate documentation
func Doc() error {
	return shellcmd.RunAll(
		`exiftool -all= -overwrite_original -ext png screenshot`,
		`exiftool -ext png -overwrite_original -XMP:Subject="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Raintank, Inc. dba Grafana Labs" screenshot`,
		`exiftool -all= -overwrite_original -ext png .github`,
		`exiftool -ext png -overwrite_original -XMP:Subject+="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Raintank, Inc. dba Grafana Labs" .github`,
		`exiftool -all= -overwrite_original -ext pdf screenshot`,
		`exiftool -ext pdf -overwrite_original -Subject="k6 dashboard report" -Title="k6 dashboard report" -Description="Example report of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Raintank, Inc. dba Grafana Labs" screenshot`,
	)
}

func slug(script string) string {
	return strings.ReplaceAll(script, "/", "-")
}

func out(script string) string {
	report := filepath.Join(workdir, slug(script)+"-report.html")
	record := filepath.Join(workdir, slug(script)+"-record.ndjson.gz")

	return "dashboard=export=" + report + "&record=" + record
}

func jsonout(script string) string {
	return "json=" + filepath.Join(workdir, slug(script)+"-result.json.gz")
}

// Run run sample script
func Run(script string) error {
	return xk6run("--out", out(script), "--out", jsonout(script), script)
}

// Replay replay test from recorded JSON file
func Replay(script string) error {
	record := filepath.Join(workdir, slug(script)+"-record.ndjson.gz")

	return sh.Run(
		cliBin(),
		"replay",
		record,
	)
}

// record test results for testing
func Testdata() error {
	out := filepath.Join("dashboard", "testdata", "result.json")
	gz := out + ".gz"

	return xk6run(
		"--out",
		"json="+out,
		"--out",
		"json="+gz,
		filepath.Join("scripts", "test.js"),
		"--out",
		"dashboard=port=-1&period=2s&record="+strings.ReplaceAll(out, ".json", ".ndjson"),
		"--out",
		"dashboard=port=-1&period=2s&record="+strings.ReplaceAll(gz, ".json", ".ndjson"),
	)
}

func cliBin() string {
	var ext string

	if runtime.GOOS == "windows" {
		ext = ".exe"
	}

	return filepath.Join(workdir, "k6-web-dashboard"+ext)
}

// build the xk6-dashboard CLI.
func Cli() error {
	mg.Deps(tools)
	mg.Deps(cliReadme)

	_, err := sh.Exec(nil, os.Stdout, os.Stderr, "goreleaser",
		"build",
		"-o",
		cliBin(),
		"--snapshot",
		"--clean",
		"--single-target",
	)

	return err
}

func cliReadme() error {
	var buff bytes.Buffer

	root := cmd.NewRootCommand()

	linkHandler := func(name string) string {
		link := strings.ReplaceAll(strings.TrimSuffix(name, ".md"), "_", "-")
		return "#" + link
	}

	if err := doc.GenMarkdownCustom(root, &buff, linkHandler); err != nil {
		return err
	}

	for _, cmd := range root.Commands() {
		if _, err := (&buff).WriteString("---\n"); err != nil {
			return err
		}

		if err := doc.GenMarkdownCustom(cmd, &buff, linkHandler); err != nil {
			return err
		}
	}

	readme := filepath.Clean(filepath.Join("cmd", "k6-web-dashboard", "README.md"))

	src, err := os.ReadFile(readme) //nolint:forbidigo
	if err != nil {
		return err
	}

	res, err := inject(src, "cli", buff.Bytes())
	if err != nil {
		return err
	}

	return os.WriteFile(readme, res, 0o600) //nolint:forbidigo
}

func inject(target []byte, name string, source []byte) ([]byte, error) {
	begin := fmt.Sprintf("<!-- begin:%s -->", name)
	end := fmt.Sprintf("<!-- end:%s -->", name)

	re, err := regexp.Compile("(?sm)^\\s*" + begin + "\\s*$.*" + end)
	if err != nil {
		return nil, err
	}

	tmp := make([]byte, 0, len(source)+len(begin)+1+len(end))

	tmp = append(tmp, []byte(begin)...)
	tmp = append(tmp, '\n')
	tmp = append(tmp, source...)
	tmp = append(tmp, []byte(end)...)

	if !re.Match(target) {
		return nil, errMissingMarker
	}

	return re.ReplaceAll(target, tmp), nil
}

var errMissingMarker = errors.New("missing marker comment")
