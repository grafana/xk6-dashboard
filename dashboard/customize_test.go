// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package dashboard

import (
	_ "embed"
	"fmt"
	"os"
	"testing"

	"github.com/grafana/sobek"
	"github.com/sirupsen/logrus"
	logtest "github.com/sirupsen/logrus/hooks/test"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
	"go.k6.io/k6/lib/fsext"
)

func Test_loadConfigJSON(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()

	conf, err := loadConfigJSON("testdata/customize/config.json", th.proc)

	assert.NoError(t, err)

	assert.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	_, err = loadConfigJSON("testdata/customize/config-bad.json", th.proc)

	assert.Error(t, err)

	_, err = loadConfigJSON("testdata/customize/config-not-exists.json", th.proc)

	assert.Error(t, err)
}

func Test_customize(t *testing.T) {
	t.Parallel()

	th := helper(t)

	conf, err := customize(testconfig, th.proc)

	assert.NoError(t, err)

	assert.False(t, gjson.GetBytes(conf, `tabs.#(id="custom")`).Exists())
}

func Test_customize_env_found(t *testing.T) {
	t.Setenv("XK6_DASHBOARD_CONFIG", "testdata/customize/config-custom.js")

	th := helper(t).osFs()

	var err error
	th.proc.wd, err = os.Getwd()
	assert.NoError(t, err)

	conf, err := customize(testconfig, th.proc)
	assert.NoError(t, err)
	fmt.Println(string(conf))

	assert.True(t, gjson.GetBytes(conf, `tabs.#(id="custom")`).Exists())

	t.Setenv("XK6_DASHBOARD_CONFIG", "testdata/customize/config.json")

	assert.NoError(t, err)
}

//go:embed testdata/customize/config/config.json
var testconfig []byte

func TestConfigInReadme(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()

	var err error
	th.proc.wd, err = os.Getwd()
	assert.NoError(t, err)

	conf, err := loadConfigJS("../.dashboard.js", testconfig, th.proc)

	assert.NoError(t, err)

	assert.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	loader, err := newConfigLoader(testconfig, th.proc)

	assert.NoError(t, err)

	_, err = loader.load("testdata/customize/config-custom.js")

	assert.NoError(t, err)
}

func assertMessageAndLevel(t *testing.T, expr string, message string, level logrus.Level) {
	t.Helper()

	runtime := sobek.New()

	runtime.SetFieldNameMapper(sobek.UncapFieldNameMapper())

	logger, hook := logtest.NewNullLogger()
	_ = runtime.Set("console", newConfigConsole(logger))

	logger.SetLevel(level)

	_, err := runtime.RunString(expr)

	assert.NoError(t, err)

	entry := hook.LastEntry()
	assert.NotNil(t, entry)

	assert.Equal(t, message, entry.Message)
	assert.Equal(t, level, entry.Level)
}

func TestConfigConsoleLevels(t *testing.T) {
	t.Parallel()

	assertMessageAndLevel(t, `console.log("a")`, "a", logrus.InfoLevel)
	assertMessageAndLevel(t, `console.debug("a")`, "a", logrus.DebugLevel)
	assertMessageAndLevel(t, `console.info("a")`, "a", logrus.InfoLevel)
	assertMessageAndLevel(t, `console.warn("a")`, "a", logrus.WarnLevel)
	assertMessageAndLevel(t, `console.error("a")`, "a", logrus.ErrorLevel)

	assertMessageAndLevel(t, `console.log("a", "b")`, "a b", logrus.InfoLevel)
}

func TestConfigConsoleJSON(t *testing.T) {
	t.Parallel()

	assertMessageAndLevel(
		t,
		`let obj = {foo:"bar"}; console.log(obj)`,
		`{"foo":"bar"}`,
		logrus.InfoLevel,
	)
}

func Test_loadConfigJS_error(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()

	conf, err := loadConfigJSON("testdata/customize/config.json", th.proc)

	assert.NoError(t, err)

	assert.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	_, err = loadConfigJS("testdata/customize/config-bad.json", testconfig, th.proc)

	assert.Error(t, err)

	_, err = loadConfigJS("testdata/customize/config-not-exists.json", testconfig, th.proc)

	assert.Error(t, err)

	conf, err = loadConfigJS(
		"testdata/customize/config-custom.js",
		[]byte("42='foo'"),
		th.proc,
	)

	assert.Nil(t, conf)
	assert.Error(t, err)
}

func Test_configLoader_eval_error(t *testing.T) {
	t.Parallel()

	evalHelper := func(src string) (*sobek.Object, error) {
		t.Helper()

		th := helper(t)
		th.proc.fs = fsext.NewMemMapFs()
		th.proc.wd = "/some/path/"

		loader, err := newConfigLoader(testconfig, th.proc)
		require.NoError(t, err)

		err = fsext.WriteFile(th.proc.fs, "/some/path/morestuff/test.js", []byte(src), 0o6)
		require.NoError(t, err)
		return loader.eval("./morestuff/test.js")
	}

	obj, err := evalHelper("invalid script")

	assert.Error(t, err)
	assert.Nil(t, obj)

	// no default export
	obj, err = evalHelper("let answer = 42")

	assert.Error(t, err)
	assert.Nil(t, obj)

	// no return value from export function
	obj, err = evalHelper("export default function() {}")

	assert.Error(t, err)
	assert.Nil(t, obj)

	// error in default export function
	obj, err = evalHelper("export default function() {throw Error()}")

	assert.Error(t, err)
	assert.Nil(t, obj)
}
