// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package dashboard

import (
	_ "embed"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
)

func Test_loadConfigJSON(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()

	conf, err := loadConfigJSON("testdata/customize/config.json", th.proc)

	require.NoError(t, err)

	require.NotNil(t, gjson.GetBytes(conf, "tabs.custom"))

	_, err = loadConfigJSON("testdata/customize/config-bad.json", th.proc)

	require.Error(t, err)

	_, err = loadConfigJSON("testdata/customize/config-not-exists.json", th.proc)

	require.Error(t, err)
}

func Test_customize(t *testing.T) {
	t.Parallel()

	th := helper(t)

	conf, err := customize(testconfig, th.proc)

	require.NoError(t, err)

	require.False(t, gjson.GetBytes(conf, `tabs.#(id="custom")`).Exists())
}

//go:embed testdata/customize/config/config.json
var testconfig []byte
