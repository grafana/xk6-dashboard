// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package customize

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"reflect"
	"strings"

	"github.com/dop251/goja"
	"github.com/sirupsen/logrus"
	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/js/compiler"
	"go.k6.io/k6/lib"
)

type configLoader struct {
	runtime       *goja.Runtime
	compiler      *compiler.Compiler
	defaultConfig *goja.Object
	state         *state.GlobalState
}

func newConfigLoader(
	defaultConfig json.RawMessage,
	state *state.GlobalState,
) (*configLoader, error) {
	comp := compiler.New(state.Logger)

	comp.Options.CompatibilityMode = lib.CompatibilityModeExtended
	comp.Options.Strict = true

	con := newConfigConsole(state.Logger)

	runtime := goja.New()

	runtime.SetFieldNameMapper(goja.UncapFieldNameMapper())

	if err := runtime.Set("console", con); err != nil {
		return nil, err
	}

	def, err := toObject(runtime, defaultConfig)
	if err != nil {
		return nil, err
	}

	loader := &configLoader{
		runtime:       runtime,
		compiler:      comp,
		defaultConfig: def,
		state:         state,
	}

	return loader, nil
}

func (loader *configLoader) load(filename string) (json.RawMessage, error) {
	file, err := loader.state.FS.Open(filename)
	if err != nil {
		return nil, err
	}

	src, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	val, err := loader.eval(src, filename)
	if err != nil {
		return nil, err
	}

	obj := val.ToObject(loader.runtime)

	return obj.MarshalJSON()
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

	if err = module.Set("exports", exports); err != nil {
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

// toObject use JavaScript JSON.parse to create native goja object
// there could be a better solution.... (but Object.UnmarshallJSON is missing).
func toObject(runtime *goja.Runtime, bin json.RawMessage) (*goja.Object, error) {
	val := runtime.Get("JSON").ToObject(runtime).Get("parse")

	call, _ := goja.AssertFunction(val)

	val, err := call(runtime.GlobalObject(), runtime.ToValue(string(bin)))
	if err != nil {
		return nil, err
	}

	return val.ToObject(runtime), nil
}

func loadConfigJS(
	filename string,
	config json.RawMessage,
	state *state.GlobalState,
) (json.RawMessage, error) {
	loader, err := newConfigLoader(config, state)
	if err != nil {
		return nil, err
	}

	return loader.load(filename)
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

	switch level {
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
