package customize

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"

	"github.com/sirupsen/logrus"
)

const (
	defaultConfig    = ".dashboard.js"
	defaultAltConfig = ".dashboard.json"
)

func findDefaultConfig() string {
	if exists(defaultConfig) {
		return defaultConfig
	}

	if exists(defaultAltConfig) {
		return defaultAltConfig
	}

	return ""
}

func Customize(uiConfig json.RawMessage) (json.RawMessage, error) {
	filename := os.Getenv("XK6_DASHBOARD_CONFIG")
	if len(filename) == 0 {
		if filename = findDefaultConfig(); len(filename) == 0 {
			return uiConfig, nil
		}
	}

	if filepath.Ext(filename) == ".json" {
		return loadConfigJSON(filename)
	}

	return loadConfigJS(filename, uiConfig, logrus.StandardLogger())
}

func loadConfigJSON(filename string) (json.RawMessage, error) {
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

func exists(filename string) bool {
	if _, err := os.Stat(filename); errors.Is(err, os.ErrNotExist) {
		return false
	}

	return true
}
