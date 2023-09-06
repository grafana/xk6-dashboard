// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package dashboard

import (
	"io"
	"math"
	"strings"
	"testing"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/lib/fsext"
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

	osFS := fsext.NewMemMapFs()

	brf := newBriefer(testDirBrief(t), nil, "", osFS, logrus.StandardLogger())

	brf.data.cumulative = recursiveJSON(t)

	assert.Error(t, brf.exportJSON(io.Discard))

	brf.data.cumulative = nil

	out := newErrorWriter(t)

	assert.Error(t, brf.exportJSON(out))
	assert.Error(t, brf.exportJSON(out.reset(1)))
	assert.Error(t, brf.exportJSON(out.reset(2)))
	assert.Error(t, brf.exportJSON(out.reset(3)))
	assert.Error(t, brf.exportJSON(out.reset(4)))
	assert.Error(t, brf.exportJSON(out.reset(5)))
	assert.Error(t, brf.exportJSON(out.reset(6)))
	assert.Error(t, brf.exportJSON(out.reset(7)))
	assert.Error(t, brf.exportJSON(out.reset(8)))
	assert.Error(t, brf.exportJSON(out.reset(9)))
	assert.Error(t, brf.exportJSON(out.reset(10)))

	assert.NoError(t, brf.exportJSON(out.reset(11)))
	assert.Equal(t, emptyData, out.String())
}

func Test_briefer_exportBase64_error(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	brf := newBriefer(testDirBrief(t), nil, "", osFS, logrus.StandardLogger())

	brf.data.cumulative = recursiveJSON(t)

	assert.Error(t, brf.exportBase64(io.Discard))

	brf.data.cumulative = nil

	out := newErrorWriter(t)

	assert.Error(t, brf.exportBase64(out))
	assert.NoError(t, brf.exportBase64(out.reset(math.MaxInt)))
	assert.Equal(t, emptyDataBase64, out.String())
}

func Test_briefer_inject_error(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	brf := newBriefer(testDirBrief(t), nil, "", osFS, logrus.StandardLogger())

	file, err := testDirBrief(t).Open("index.html")

	assert.NoError(t, err)

	html, err := io.ReadAll(file)

	assert.NoError(t, err)

	out := newErrorWriter(t)

	assert.Panics(t, func() {
		_, _ = brf.inject(out, []byte{}, []byte(dataTag), nil)
	})

	_, err = brf.inject(out, html, []byte(dataTag), func(out io.Writer) error {
		_, err = out.Write([]byte("Hello, World!"))

		return err
	})

	assert.Error(t, err)
}

func Test_briefer_onEvent(t *testing.T) {
	t.Parallel()

	osFS := fsext.NewMemMapFs()

	brf := newBriefer(testDirBrief(t), nil, "", osFS, logrus.StandardLogger())

	data := make(map[string]interface{})

	brf.onEvent(snapshotEvent, data)

	assert.Equal(t, "{}\n", brf.data.buff.String())

	brf.onEvent(snapshotEvent, data)

	assert.Equal(t, "{}\n,{}\n", brf.data.buff.String())

	data["bad"] = recursiveJSON(t)

	brf.onEvent(snapshotEvent, data) // error while marshalling JSON, null will be write

	assert.Equal(t, "{}\n,{}\n,null\n", brf.data.buff.String())

	data["foo"] = "bar"

	brf.onEvent(cumulativeEvent, data)

	assert.Equal(t, data, brf.data.cumulative)
}

const (
	emptyData       = `{"cumulative":null,"param":null,"config":null,"metrics":{},"snapshot":[]}`
	emptyDataBase64 = `H4sIAAAAAAAA/6pWSi7NLc1JLMksS1WyyivNydFRKkgsSsyFcZLz89Iy02G83NSSoszkYiWr6lodpeK8xILijPwSJavo2FpAAAAA///7qm9QSQAAAA==`
	emptyDataScript = `<script id="data" type="application/json; charset=utf-8; gzip; base64">` + emptyDataBase64
)
