// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

//go:build mage

package main

import (
	"path/filepath"

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

// Run run sample script
func Run() error {
	return xk6run(
		"--out",
		"dashboard='period=10s&report="+filepath.Join(workdir, "test_result_run.html"),
		"script.js",
	)
}

// Record record test result in JSON file
func Record() error {
	return xk6run("--out", "json="+filepath.Join(workdir, "test_result.json.gz"), "script.js")
}

// Replay replay test from recorded JSON file
func Replay() error {
	return sh.Run(
		"xk6",
		"dashboard",
		"replay",
		"--report",
		filepath.Join(workdir, "test_result_replay.html"),
		filepath.Join(workdir, "test_result.json.gz"),
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
