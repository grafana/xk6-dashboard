// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

//go:build mage
// +build mage

package main

import (
	"path/filepath"
	"strings"

	"github.com/magefile/mage/sh"
	"github.com/princjef/mageutil/bintool"
	"github.com/princjef/mageutil/shellcmd"
)

var Default = All

var linter = bintool.Must(bintool.New(
	"golangci-lint{{.BinExt}}",
	"1.51.1",
	"https://github.com/golangci/golangci-lint/releases/download/v{{.Version}}/golangci-lint-{{.Version}}-{{.GOOS}}-{{.GOARCH}}{{.ArchiveExt}}",
))

func Lint() error {
	if err := linter.Ensure(); err != nil {
		return err
	}

	return linter.Command(`run`).Run()
}

func Test() error {
	return shellcmd.Command(`go test -count 1 -coverprofile=coverage.txt ./...`).Run()
}

func Build() error {
	return shellcmd.Command(`xk6 build --with github.com/szkiba/xk6-dashboard=.`).Run()
}

func It() error {
	all, err := filepath.Glob("scripts/*.js")
	if err != nil {
		return err
	}

	for _, script := range all {
		err := xk6run("--out dashboard='period=100ms' " + script).Run()
		if err != nil {
			return err
		}
	}

	return nil
}

func Coverage() error {
	return shellcmd.Command(`go tool cover -html=coverage.txt`).Run()
}

func glob(patterns ...string) (string, error) {
	buff := new(strings.Builder)

	for _, p := range patterns {
		m, err := filepath.Glob(p)
		if err != nil {
			return "", err
		}

		_, err = buff.WriteString(strings.Join(m, " ") + " ")
		if err != nil {
			return "", err
		}
	}

	return buff.String(), nil
}

func License() error {
	all, err := glob(
		"*.go",
		"*/*.go",
		".*.yml",
		".gitignore",
		"*/.gitignore",
		"*.ts",
		"*/*ts",
		".github/workflows/*",
		//
		"assets/packages/ui/*.yml",
		"assets/packages/ui/*.js",
		"assets/packages/ui/.gitignore",
		"assets/packages/ui/src/*",
		//
		"assets/packages/brief/*.yml",
		"assets/packages/brief/*.js",
		"assets/packages/brief/.gitignore",
		"assets/packages/brief/src/*",
	)
	if err != nil {
		return err
	}

	return shellcmd.Command(
		`reuse annotate --copyright "Iván Szkiba" --merge-copyrights --license MIT --skip-unrecognised ` + all,
	).Run()
}

func Clean() error {
	sh.Rm("magefiles/bin")
	sh.Rm("coverage.txt")
	sh.Rm("bin")
	sh.Rm("assets/packages/ui/node_modules")
	sh.Rm("assets/packages/brief/node_modules")
	sh.Rm("k6")

	return nil
}

func All() error {
	if err := Lint(); err != nil {
		return err
	}

	if err := Test(); err != nil {
		return err
	}

	if err := Build(); err != nil {
		return err
	}

	return It()
}

func yarn(arg string) shellcmd.Command {
	return shellcmd.Command("yarn --silent --cwd assets " + arg)
}

func Prepare() error {
	return yarn("install").Run()
}

func Assets() error {
	return yarn("build").Run()
}

func Exif() error {
	return shellcmd.RunAll(
		`exiftool -all= -overwrite_original -ext png screenshot`,
		`exiftool -ext png -overwrite_original -XMP:Subject+="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Ivan SZKIBA" screenshot`,
		`exiftool -all= -overwrite_original -ext png .github`,
		`exiftool -ext png -overwrite_original -XMP:Subject+="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Ivan SZKIBA" .github`,
		`exiftool -ext pdf -overwrite_original -Subject+="k6 dashboard report" -Title="k6 dashboard report" -Description="Example report of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Ivan SZKIBA" screenshot`,
	)
}

func xk6run(arg string) shellcmd.Command {
	return shellcmd.Command("xk6 run --quiet --no-summary --no-usage-report " + arg)
}

func Run() error {
	return xk6run(`--out dashboard='period=10s&report=test_result_run.html' script.js`).Run()
}

func Report() error {
	return xk6run(`--out dashboard='period=100ms&report=test_result_report.html' scripts/test.js`).Run()
}

func ReportGZ() error {
	return xk6run(`--out dashboard='period=100ms&report=test_result_report.html.gz' scripts/test.js`).Run()
}

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
