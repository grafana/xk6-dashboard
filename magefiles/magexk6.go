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
	"strings"

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

	bindir = filepath.Join(cwd, ".bin")
	workdir = filepath.Join(cwd, "build")

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

	return exists(filepath.Join("assets", "package.json"))
}

// tools downloads k6 golangci-lint configuration, golangci-lint and xk6 binary.
func tools() error {
	resp, err := http.Get("https://raw.githubusercontent.com/grafana/k6/master/.golangci.yml")
	if err != nil {
		return err
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

	if err := linter.Ensure(); err != nil {
		return err
	}

	if err := goinstall("go.k6.io/xk6/cmd/xk6@latest"); err != nil {
		return err
	}

	if hasAssets() {
		return sh.Run("yarn", "--silent", "--cwd", "assets", "install")
	}

	return nil
}

func xk6build() error {
	return sh.Run("xk6", "build", "--with", module+"=.")
}

func xk6run(args ...string) error {
	fix := []string{"run", "--quiet", "--no-summary", "--no-usage-report"}
	return sh.Run("xk6", append(fix, args...)...)
}

func generate() error {
	if err := sh.Run("go", "generate", "./..."); err != nil {
		return err
	}

	if hasAssets() {
		return sh.Run("yarn", "--silent", "--cwd", "assets", "build")
	}

	return nil
}

func coverprofile() string {
	return filepath.Join(workdir, "coverage.txt")
}

func test() error {
	return sh.Run("go", "test", "-count", "1", "-coverprofile="+coverprofile(), "./...")
}

func cover() error {
	return sh.Run("go", "tool", "cover", "-html="+coverprofile())
}

func clean() error {
	sh.Rm("build")
	sh.Rm(".bin")
	sh.Rm("k6")
	sh.Rm("assets/node_modules")

	if hasAssets() {
		dirs, err := filepath.Glob("assets/packages/*/node_modules")
		if err == nil {
			for _, file := range dirs {
				sh.Rm(file)
			}
		}
	}

	return nil
}
