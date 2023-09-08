// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_assetDir(t *testing.T) {
	t.Parallel()

	fs := assetDir("hu", testdata)

	assert.NotNil(t, fs)
	assert.Panics(t, func() {
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

	assert.NotNil(t, assets.ui)

	file, err := assets.ui.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())

	assert.NotNil(t, assets.report)

	file, err = assets.report.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())

	assert.NotNil(t, assets.config)

	conf := map[string]interface{}{}

	assert.NoError(t, json.Unmarshal(assets.config, &conf))
}
