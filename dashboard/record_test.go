// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package dashboard

import (
	"compress/gzip"
	"encoding/json"
	"io"
	"testing"

	"github.com/sirupsen/logrus"
	logtest "github.com/sirupsen/logrus/hooks/test"
	"github.com/stretchr/testify/assert"
)

func Test_newRecorder(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("foo", th.proc)

	assert.NotNil(t, rec)
	assert.Equal(t, "foo", rec.output)
	assert.Same(t, th.proc, rec.proc)
}

func Test_recorder_onStart(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("foo", th.proc)

	assert.NoError(t, rec.onStart())

	assert.NotNil(t, rec.encoder)

	assert.True(t, exists(th.proc.fs, "foo"))

	assert.NoError(t, rec.onStop(nil))
}

func Test_recorder_onStart_error(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()

	rec := newRecorder("..", th.proc)

	assert.Error(t, rec.onStart())
}

func Test_recorder_onEvent_config(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("out", th.proc)

	assert.NoError(t, rec.onStart())

	data := map[string]interface{}{"foo": "bar"}

	rec.onEvent("config", data)

	assert.NoError(t, rec.onStop(nil))

	file, err := th.proc.fs.Open("out")

	assert.NoError(t, err)

	content, err := io.ReadAll(file)

	assert.NoError(t, err)
	assert.Empty(t, content)
	assert.NoError(t, file.Close())
}

func Test_recorder_onEvent(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("out.gz", th.proc)

	assert.NoError(t, rec.onStart())

	data := map[string]interface{}{"foo": "bar"}

	rec.onEvent("dummy", data)

	assert.NoError(t, rec.onStop(nil))

	file, err := th.proc.fs.Open("out.gz")

	assert.NoError(t, err)

	reader, err := gzip.NewReader(file)

	assert.NoError(t, err)

	content, err := io.ReadAll(reader)

	assert.NoError(t, err)

	env := new(replayerEnvelope)

	assert.NoError(t, json.Unmarshal(content, env))

	assert.Equal(t, &replayerEnvelope{Name: "dummy", Data: data}, env)

	assert.NoError(t, reader.Close())
	assert.NoError(t, file.Close())
}

func Test_recorder_onEvent_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("out", th.proc)

	assert.NoError(t, rec.onStart())

	data := recursiveJSON(t)

	logger, hook := logtest.NewNullLogger()

	rec.proc.logger = logger

	rec.onEvent("dummy", data)

	entry := hook.LastEntry()
	assert.NotNil(t, entry)
	assert.Equal(t, logrus.WarnLevel, entry.Level)

	assert.NoError(t, rec.onStop(nil))
}
