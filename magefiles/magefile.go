// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

//go:build mage

package main

import (
	"path/filepath"
	"strings"

	"github.com/magefile/mage/sh"
	"github.com/princjef/mageutil/shellcmd"
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

	return "dashboard=report=" + report + "&record=" + record
}

func jsonout(script string) string {
	return "json=" + filepath.Join(workdir, slug(script)+"-result.json.gz")
}

// Run run sample script
func Run(script string) error {
	return xk6run("--out", out(script), "--out", jsonout(script), "script.js")
}

// Replay replay test from recorded JSON file
func Replay(script string) error {
	record := filepath.Join(workdir, slug(script)+"-record.ndjson.gz")

	return sh.Run(
		"xk6",
		"dashboard",
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
	)
}

// update license headers
func License() error {
	return license()
}
