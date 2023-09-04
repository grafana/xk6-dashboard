package customize

import (
	_ "embed"
	"testing"

	"github.com/dop251/goja"
	"github.com/sirupsen/logrus"
	logtest "github.com/sirupsen/logrus/hooks/test"
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

//go:embed testdata/config/config.json
var testconfig []byte

func TestConfigInReadme(t *testing.T) {
	t.Parallel()

	conf, err := loadConfigJS("../.dashboard.js", testconfig, logrus.StandardLogger())

	assert.NoError(t, err)

	assert.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	loader, err := newConfigLoader(testconfig, logrus.StandardLogger())

	assert.NoError(t, err)

	_, err = loader.load("testdata/config-custom.js")

	assert.NoError(t, err)
}

func assertMessageAndLevel(t *testing.T, expr string, message string, level logrus.Level) {
	t.Helper()

	runtime := goja.New()

	runtime.SetFieldNameMapper(goja.UncapFieldNameMapper())

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

	assertMessageAndLevel(t, `let obj = {foo:"bar"}; console.log(obj)`, `{"foo":"bar"}`, logrus.InfoLevel)
}

func Test_loadConfigJS_error(t *testing.T) {
	t.Parallel()

	conf, err := loadConfigJSON("testdata/config.json")

	assert.NoError(t, err)

	assert.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	_, err = loadConfigJS("testdata/config-bad.json", testconfig, logrus.StandardLogger())

	assert.Error(t, err)

	_, err = loadConfigJS("testdata/config-not-exists.json", testconfig, logrus.StandardLogger())

	assert.Error(t, err)

	conf, err = loadConfigJS("testdata/config-custom.js", []byte("42='foo'"), logrus.StandardLogger())

	assert.Nil(t, conf)
	assert.Error(t, err)
}

func Test_configLoader_eval_error(t *testing.T) {
	t.Parallel()

	loader, err := newConfigLoader(testconfig, logrus.StandardLogger())

	assert.NoError(t, err)

	obj, err := loader.eval([]byte("invalid script"), "")

	assert.Error(t, err)
	assert.Nil(t, obj)

	// no default export
	obj, err = loader.eval([]byte("let answer = 42"), "")

	assert.Error(t, err)
	assert.Nil(t, obj)

	// no return value from export function
	obj, err = loader.eval([]byte("export default function() {}"), "")

	assert.Error(t, err)
	assert.Nil(t, obj)

	// error in default export function
	obj, err = loader.eval([]byte("export default function() {throw Error()}"), "")

	assert.Error(t, err)
	assert.Nil(t, obj)
}
