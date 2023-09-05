// Package customize adds custom dashboard configuration handling.
package customize

import (
	"context"
	"encoding/json"
	"io"
	"path/filepath"

	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/lib/fsext"
)

const (
	defaultConfig    = ".dashboard.js"
	defaultAltConfig = ".dashboard.json"
)

func findDefaultConfig(fs fsext.Fs) string {
	if exists(fs, defaultConfig) {
		return defaultConfig
	}

	if exists(fs, defaultAltConfig) {
		return defaultAltConfig
	}

	return ""
}

// Customize allows using custom dashboard configuration.
func Customize(uiConfig json.RawMessage) (json.RawMessage, error) {
	state := state.NewGlobalState(context.Background())

	filename, ok := state.Env["XK6_DASHBOARD_CONFIG"]
	if !ok || len(filename) == 0 {
		if filename = findDefaultConfig(state.FS); len(filename) == 0 {
			return uiConfig, nil
		}
	}

	if filepath.Ext(filename) == ".json" {
		return loadConfigJSON(filename, state)
	}

	return loadConfigJS(filename, uiConfig, state)
}

func loadConfigJSON(filename string, state *state.GlobalState) (json.RawMessage, error) {
	file, err := state.FS.Open(filename)
	if err != nil {
		return nil, err
	}

	bin, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	conf := map[string]interface{}{}

	if err := json.Unmarshal(bin, &conf); err != nil {
		return nil, err
	}

	return json.Marshal(conf)
}

func exists(fs fsext.Fs, filename string) bool {
	if _, err := fs.Stat(filename); err != nil {
		return false
	}

	return true
}
