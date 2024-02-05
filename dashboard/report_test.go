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

func (writer *errorWriter) reset(maxWrite int) *errorWriter {
	writer.testingT.Helper()

	writer.maxWrite = maxWrite
	writer.buff.Reset()

	return writer
}

func (writer *errorWriter) String() string {
	writer.testingT.Helper()

	return writer.buff.String()
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

	assert.Error(t, rep.exportJSON(io.Discard))

	rep.data.cumulative = nil

	data := make(map[string]interface{})

	rep.onEvent(snapshotEvent, data)

	out := newErrorWriter(t)

	assert.Error(t, rep.exportJSON(out))
	assert.NoError(t, rep.exportJSON(out.reset(2)))

	exp := `{"event":"snapshot","data":{}}` + "\n"

	assert.Equal(t, exp, out.String())
}

func Test_briefer_exportBase64_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	th.assets.config = nil

	rep := newReporter("", th.assets, th.proc)

	rep.data.cumulative = &recorderEnvelope{Name: "dummy", Data: recursiveJSON(t)}

	assert.Error(t, rep.exportBase64(io.Discard))

	rep.data.cumulative = nil

	out := newErrorWriter(t)

	assert.Error(t, rep.exportBase64(out))
	assert.NoError(t, rep.exportBase64(out.reset(math.MaxInt)))
	assert.Equal(t, emptyDataBase64, out.String())
}

func Test_briefer_inject_error(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rep := newReporter("", th.assets, th.proc)

	file, err := th.assets.report.Open("index.html")

	assert.NoError(t, err)

	html, err := io.ReadAll(file)

	assert.NoError(t, err)

	out := newErrorWriter(t)

	assert.Panics(t, func() {
		_, _ = rep.inject(out, []byte{}, []byte(dataTag), nil)
	})

	_, err = rep.inject(out, html, []byte(dataTag), func(out io.Writer) error {
		_, err = out.Write([]byte("Hello, World!"))

		return err
	})

	assert.Error(t, err)
}

func Test_briefer_onEvent(t *testing.T) {
	t.Parallel()

	th := helper(t)

	rep := newReporter("", th.assets, th.proc)

	data := make(map[string]interface{})

	rep.onEvent(snapshotEvent, data)

	exp := `{"event":"snapshot","data":{}}` + "\n"

	assert.Equal(t, exp, rep.data.buff.String())

	rep.onEvent(snapshotEvent, data)

	assert.Equal(t, exp+exp, rep.data.buff.String())

	data["bad"] = recursiveJSON(t)

	rep.onEvent(snapshotEvent, data) // error while marshalling JSON, null will be write

	assert.Equal(t, exp+exp+"null\n", rep.data.buff.String())

	data["foo"] = "bar"

	rep.onEvent(cumulativeEvent, data)

	envelope := &recorderEnvelope{Name: cumulativeEvent, Data: data}

	assert.Equal(t, envelope, rep.data.cumulative)

	data = map[string]interface{}{"foo": []string{"bar > 0"}}

	rep.onEvent(thresholdEvent, data)

	envelope = &recorderEnvelope{Name: thresholdEvent, Data: data}

	assert.Equal(t, envelope, rep.data.threshold)
}

const (
	emptyData       = ``
	emptyDataBase64 = `H4sIAAAAAAAA/wEAAP//AAAAAAAAAAA=`
	emptyDataScript = `<script id="data" type="application/json; charset=utf-8; gzip; base64">` + emptyDataBase64
)
