package dashboard

import (
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/dop251/goja"
	"github.com/sirupsen/logrus"
	"go.k6.io/k6/js/compiler"
	"go.k6.io/k6/lib"
)

//go:embed config.js
var config []byte

type configLoader struct {
	runtime       *goja.Runtime
	compiler      *compiler.Compiler
	defaultConfig *goja.Object
}

func newConfigLoader(logger logrus.FieldLogger) (*configLoader, error) {
	comp := compiler.New(logger)

	comp.Options.CompatibilityMode = lib.CompatibilityModeExtended
	comp.Options.Strict = true

	con := newConfigConsole(logger)

	runtime := goja.New()

	runtime.SetFieldNameMapper(goja.UncapFieldNameMapper())

	if err := runtime.Set("console", con); err != nil {
		return nil, err
	}

	exports := runtime.NewObject()
	module := runtime.NewObject()

	if err := module.Set("exports", exports); err != nil {
		return nil, err
	}

	loader := &configLoader{ //nolint:exhaustruct
		runtime:  runtime,
		compiler: comp,
	}

	return loader, nil
}

func (loader *configLoader) load(filename string) (map[string]interface{}, error) {
	src, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	return loader.run(src, filename)
}

func isObject(val goja.Value) bool {
	return val != nil && val.ExportType() != nil && val.ExportType().Kind() == reflect.Map
}

func (loader *configLoader) eval(src []byte, filename string) (*goja.Object, error) {
	prog, _, err := loader.compiler.Compile(string(src), filename, false)
	if err != nil {
		return nil, err
	}

	exports := loader.runtime.NewObject()
	module := loader.runtime.NewObject()

	if err := module.Set("exports", exports); err != nil {
		return nil, err
	}

	val, err := loader.runtime.RunProgram(prog)
	if err != nil {
		return nil, err
	}

	call, isCallable := goja.AssertFunction(val)
	if !isCallable {
		return nil, fmt.Errorf("%w, file: %s", errNotFunction, filename)
	}

	_, err = call(exports, module, exports)
	if err != nil {
		return nil, err
	}

	def := exports.Get("default")
	if def == nil {
		return nil, fmt.Errorf("%w, file: %s", errNoExport, filename)
	}

	if call, isCallable = goja.AssertFunction(def); isCallable {
		def, err = call(exports, loader.defaultConfig)
		if err != nil {
			return nil, err
		}

		if !isObject(def) {
			return nil, errConfigNotObject
		}
	}

	return def.ToObject(loader.runtime), nil
}

func (loader *configLoader) run(src []byte, filename string) (map[string]interface{}, error) {
	val, err := loader.eval(src, filename)
	if err != nil {
		return nil, err
	}

	obj := val.ToObject(loader.runtime)

	bin, err := obj.MarshalJSON()
	if err != nil {
		return nil, err
	}

	ret := map[string]interface{}{}

	err = json.Unmarshal(bin, &ret)

	return ret, err
}

func (loader *configLoader) loadDefaultConfig() error {
	conf, err := loader.run(config, "")
	if err != nil {
		return err
	}

	// use JavaScript JSON.parse to create native goja object
	// there could be a better solution.... (but Object.UnmarshallJSON is missing)

	bin, err := json.Marshal(conf)
	if err != nil {
		return err
	}

	val := loader.runtime.Get("JSON").ToObject(loader.runtime).Get("parse")

	call, _ := goja.AssertFunction(val)

	val, err = call(loader.runtime.GlobalObject(), loader.runtime.ToValue(string(bin)))
	if err != nil {
		return err
	}

	loader.defaultConfig = val.ToObject(loader.runtime)

	return nil
}

func loadConfig(filename string, logger logrus.FieldLogger) (json.RawMessage, error) {
	if filepath.Ext(filename) == ".json" {
		bin, err := os.ReadFile(filename)
		if err != nil {
			return nil, err
		}

		conf := map[string]interface{}{}

		if err := json.Unmarshal(bin, &conf); err != nil {
			return nil, err
		}

		return json.Marshal(conf)
	}

	loader, err := newConfigLoader(logger)
	if err != nil {
		return nil, err
	}

	if err := loader.loadDefaultConfig(); err != nil {
		return nil, err
	}

	if len(filename) == 0 {
		return loader.defaultConfig.MarshalJSON()
	}

	content, err := loader.load(filename)
	if err != nil {
		return nil, err
	}

	return json.Marshal(content)
}

// configConsole represents a JS configConsole implemented as a logrus.Logger.
type configConsole struct {
	logger logrus.FieldLogger
}

// Creates a console with the standard logrus logger.
func newConfigConsole(logger logrus.FieldLogger) *configConsole {
	return &configConsole{logger.WithField("source", "console").WithField("extension", "dashboard")}
}

func (c configConsole) log(level logrus.Level, args ...goja.Value) {
	var strs strings.Builder

	for i := 0; i < len(args); i++ {
		if i > 0 {
			strs.WriteString(" ")
		}

		strs.WriteString(c.valueString(args[i]))
	}

	msg := strs.String()

	switch level { //nolint:exhaustive
	case logrus.DebugLevel:
		c.logger.Debug(msg)

	case logrus.InfoLevel:
		c.logger.Info(msg)

	case logrus.WarnLevel:
		c.logger.Warn(msg)

	case logrus.ErrorLevel:
		c.logger.Error(msg)

	default:
		c.logger.Info(msg)
	}
}

func (c configConsole) Log(args ...goja.Value) {
	c.Info(args...)
}

func (c configConsole) Debug(args ...goja.Value) {
	c.log(logrus.DebugLevel, args...)
}

func (c configConsole) Info(args ...goja.Value) {
	c.log(logrus.InfoLevel, args...)
}

func (c configConsole) Warn(args ...goja.Value) {
	c.log(logrus.WarnLevel, args...)
}

func (c configConsole) Error(args ...goja.Value) {
	c.log(logrus.ErrorLevel, args...)
}

func (c configConsole) valueString(value goja.Value) string {
	mv, ok := value.(json.Marshaler)
	if !ok {
		return value.String()
	}

	bin, err := json.Marshal(mv)
	if err != nil {
		return value.String()
	}

	return string(bin)
}

var (
	errNotFunction     = errors.New("not a function")
	errNoExport        = errors.New("missing default export")
	errConfigNotObject = errors.New("returned configuration is not an object")
)
