// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package dashboard

import (
	"io"
	"math"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type errorWriter struct {
	testingT *testing.T
	maxWrite int
	buff     strings.Builder
}

func newErrorWriter(t *testing.T) *errorWriter {
	t.Helper()

	return &errorWriter{testingT: t} //nolint:exhaustruct
}

func (writer *errorWriter) Write(data []byte) (int, error) {
	writer.testingT.Helper()

	if writer.maxWrite <= 0 {
		return 0, assert.AnError
	}

	writer.maxWrite--

	return writer.buff.Write(data)
}

func (writer *errorWriter) Close() error {
	writer.testingT.Helper()

	return assert.AnError
}

func (writer *errorWriter) String() string {
	writer.testingT.Helper()

	return writer.buff.String()
}

func (writer *errorWriter) reset(maxWrite int) *errorWriter {
	writer.testingT.Helper()

	writer.maxWrite = maxWrite
	writer.buff.Reset()

	return writer
}

func recursiveJSON(t *testing.T) interface{} {
	t.Helper()

	type badType struct {
		Self *badType `json:"self"`
	}

	bad := new(badType)

	bad.Self = bad

	return bad
}

func Test_briefer_exportJSON_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	th.assets.config = nil

	rep := newReporter("", th.assets, th.proc)

	rep.data.cumulative = &recorderEnvelope{Name: "dummy", Data: recursiveJSON(t)}

	require.Error(t, rep.exportJSON(io.Discard))

	rep.data.cumulative = nil

	data := make(map[string]interface{})

	rep.onEvent(snapshotEvent, data)

	out := newErrorWriter(t)

	require.Error(t, rep.exportJSON(out))
	require.NoError(t, rep.exportJSON(out.reset(2)))

	exp := `{"event":"snapshot","data":{}}` + "\n"

	require.Equal(t, exp, out.String())
}

func Test_briefer_exportBase64_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	th.assets.config = nil

	rep := newReporter("", th.assets, th.proc)

	rep.data.cumulative = &recorderEnvelope{Name: "dummy", Data: recursiveJSON(t)}

	require.Error(t, rep.exportBase64(io.Discard))

	rep.data.cumulative = nil

	out := newErrorWriter(t)

	require.Error(t, rep.exportBase64(out))
	require.NoError(t, rep.exportBase64(out.reset(math.MaxInt)))
	require.Equal(t, emptyDataBase64, out.String())
}

func Test_briefer_inject_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rep := newReporter("", th.assets, th.proc)

	file, err := th.assets.report.Open("index.html")

	require.NoError(t, err)

	html, err := io.ReadAll(file)

	require.NoError(t, err)

	out := newErrorWriter(t)

	require.Panics(t, func() {
		_, _ = rep.inject(out, []byte{}, []byte(dataTag), nil)
	})

	_, err = rep.inject(out, html, []byte(dataTag), func(out io.Writer) error {
		_, err = out.Write([]byte("Hello, World!"))

		return err
	})

	require.Error(t, err)
}

func Test_briefer_onEvent(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rep := newReporter("", th.assets, th.proc)

	data := make(map[string]interface{})

	rep.onEvent(snapshotEvent, data)

	exp := `{"event":"snapshot","data":{}}` + "\n"

	require.Equal(t, exp, rep.data.buff.String())

	rep.onEvent(snapshotEvent, data)

	require.Equal(t, exp+exp, rep.data.buff.String())

	data["bad"] = recursiveJSON(t)

	rep.onEvent(snapshotEvent, data) // error while marshalling JSON, null will be write

	require.Equal(t, exp+exp+"null\n", rep.data.buff.String())

	data["foo"] = "bar"

	rep.onEvent(cumulativeEvent, data)

	envelope := &recorderEnvelope{Name: cumulativeEvent, Data: data}

	require.Equal(t, envelope, rep.data.cumulative)

	data = map[string]interface{}{"foo": []string{"bar > 0"}}

	rep.onEvent(thresholdEvent, data)

	envelope = &recorderEnvelope{Name: thresholdEvent, Data: data}

	require.Equal(t, envelope, rep.data.threshold)
}

const (
	emptyData       = ``
	emptyDataBase64 = `H4sIAAAAAAAA/wEAAP//AAAAAAAAAAA=`
	emptyDataScript = `<script id="data" type="application/json; charset=utf-8; gzip; base64">` + emptyDataBase64
)
