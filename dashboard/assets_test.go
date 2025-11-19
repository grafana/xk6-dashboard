// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"io/fs"
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_newAssets(t *testing.T) {
	t.Parallel()

	assertAssets(t, newTestAssets(t))

	assertAssets(t, newAssets())
}

func assertAssets(t *testing.T, assets *assets) {
	t.Helper()

	require.NotNil(t, assets.ui)

	contents, err := fs.ReadFile(assets.ui, "index.html")

	require.NoError(t, err)
	require.NotEmpty(t, contents)

	require.NotEmpty(t, assets.report)
	require.NotEmpty(t, assets.config)

	conf := map[string]interface{}{}

	require.NoError(t, json.Unmarshal(assets.config, &conf))
}
