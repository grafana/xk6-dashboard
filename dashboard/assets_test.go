// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_assetDir(t *testing.T) {
	t.Parallel()

	fs := assetDir("hu", testdata)

	require.NotNil(t, fs)
	require.Panics(t, func() {
		assetDir("..", testdata)
	})
}

func Test_newAssets(t *testing.T) {
	t.Parallel()

	assertAssets(t, newTestAssets(t))

	assertAssets(t, newAssets())
}

func assertAssets(t *testing.T, assets *assets) {
	t.Helper()

	require.NotNil(t, assets.ui)

	file, err := assets.ui.Open("index.html")

	require.NoError(t, err)
	require.NotNil(t, file)

	require.NoError(t, file.Close())

	require.NotNil(t, assets.report)

	file, err = assets.report.Open("index.html")

	require.NoError(t, err)
	require.NotNil(t, file)

	require.NoError(t, file.Close())

	require.NotNil(t, assets.config)

	conf := map[string]interface{}{}

	require.NoError(t, json.Unmarshal(assets.config, &conf))
}
