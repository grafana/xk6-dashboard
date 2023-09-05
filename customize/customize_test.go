package customize

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
	"go.k6.io/k6/cmd/state"
)

func Test_loadConfigJSON(t *testing.T) {
	t.Parallel()

	state := state.NewGlobalState(context.Background())

	conf, err := loadConfigJSON("testdata/config.json", state)

	assert.NoError(t, err)

	assert.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	_, err = loadConfigJSON("testdata/config-bad.json", state)

	assert.Error(t, err)

	_, err = loadConfigJSON("testdata/config-not-exists.json", state)

	assert.Error(t, err)
}

func TestCustomize(t *testing.T) {
	t.Parallel()

	conf, err := Customize(testconfig)

	assert.NoError(t, err)

	assert.False(t, gjson.GetBytes(conf, `tabs.#(id="custom")`).Exists())
}

func TestCustomize_env_found(t *testing.T) { //nolint:paralleltest
	t.Setenv("XK6_DASHBOARD_CONFIG", "testdata/config-custom.js")

	conf, err := Customize(testconfig)

	assert.NoError(t, err)

	assert.True(t, gjson.GetBytes(conf, `tabs.#(id="custom")`).Exists())

	t.Setenv("XK6_DASHBOARD_CONFIG", "testdata/config.json")

	assert.NoError(t, err)
}
