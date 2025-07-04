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
	"github.com/stretchr/testify/require"
)

func Test_newRecorder(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("foo", th.proc)

	require.NotNil(t, rec)
	require.Equal(t, "foo", rec.output)
	require.Same(t, th.proc, rec.proc)
}

func Test_recorder_onStart(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("foo", th.proc)

	require.NoError(t, rec.onStart())

	require.NotNil(t, rec.encoder)

	require.True(t, exists(th.proc.fs, "foo"))

	require.NoError(t, rec.onStop(nil))
}

func Test_recorder_onStart_error(t *testing.T) {
	t.Parallel()

	th := helper(t).osFs()

	rec := newRecorder("..", th.proc)

	require.Error(t, rec.onStart())
}

func Test_recorder_onEvent_config(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("out", th.proc)

	require.NoError(t, rec.onStart())

	data := map[string]interface{}{"foo": "bar"}

	rec.onEvent("config", data)

	require.NoError(t, rec.onStop(nil))

	file, err := th.proc.fs.Open("out")

	require.NoError(t, err)

	content, err := io.ReadAll(file)

	require.NoError(t, err)
	require.Empty(t, content)
	require.NoError(t, file.Close())
}

func Test_recorder_onEvent(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("out.gz", th.proc)

	require.NoError(t, rec.onStart())

	data := map[string]interface{}{"foo": "bar"}

	rec.onEvent("dummy", data)

	require.NoError(t, rec.onStop(nil))

	file, err := th.proc.fs.Open("out.gz")

	require.NoError(t, err)

	reader, err := gzip.NewReader(file)

	require.NoError(t, err)

	content, err := io.ReadAll(reader)

	require.NoError(t, err)

	env := new(replayerEnvelope)

	require.NoError(t, json.Unmarshal(content, env))

	require.Equal(t, &replayerEnvelope{Name: "dummy", Data: data}, env)

	require.NoError(t, reader.Close())
	require.NoError(t, file.Close())
}

func Test_recorder_onEvent_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rec := newRecorder("out", th.proc)

	require.NoError(t, rec.onStart())

	data := recursiveJSON(t)

	logger, hook := logtest.NewNullLogger()

	rec.proc.logger = logger

	rec.onEvent("dummy", data)

	entry := hook.LastEntry()
	require.NotNil(t, entry)
	require.Equal(t, logrus.WarnLevel, entry.Level)

	require.NoError(t, rec.onStop(nil))
}
