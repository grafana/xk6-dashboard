// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

//go:build mage

package main

import (
	"github.com/magefile/mage/sh"
	"github.com/princjef/mageutil/shellcmd"
)

var Default = All

// download required build tools
func Tools() error {
	return tools()
}

// run the golangci-lint linter
func Lint() error {
	return sh.Run("golangci-lint", "run")
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
	Test()
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
		`exiftool -ext png -overwrite_original -XMP:Subject+="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Ivan SZKIBA" screenshot`,
		`exiftool -all= -overwrite_original -ext png .github`,
		`exiftool -ext png -overwrite_original -XMP:Subject+="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Ivan SZKIBA" .github`,
		`exiftool -ext pdf -overwrite_original -Subject+="k6 dashboard report" -Title="k6 dashboard report" -Description="Example report of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Ivan SZKIBA" screenshot`,
	)
}

func Run() error {
	return xk6run(`--out dashboard='period=10s&report=test_result_run.html' script.js`)
}

/*
type Record mg.Namespace

func Hour() error {
	return xk6run(`--out dashboard='report=test_result_hour.html' script-hour.js`).Run()
}

func Record() error {
	return xk6run(`--out json=test_result.json script.js`).Run()
}

func RecordGZ() error {
	return xk6run(`--out json=test_result.gz script.js`).Run()
}

func RecordTest() error {
	return xk6run(`--out json=dashboard/testdata/result.json scripts/test.js`).Run()
}

func RecordTestGZ() error {
	return xk6run(`--out json=dashboard/testdata/result.gz scripts/test.js`).Run()
}

func xk6dashboard(arg string) shellcmd.Command {
	return shellcmd.Command("xk6 dashboard  " + arg)
}

func Replay() error {
	return xk6dashboard(`replay test_result.json`).Run()
}

func ReplayGZ() error {
	return xk6dashboard(`replay test_result.gz`).Run()
}
*/
