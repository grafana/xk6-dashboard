package dashboard

import (
	"embed"
	"io"
	"math"
	"strings"
	"testing"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/szkiba/xk6-dashboard/assets"
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

	brf := newBriefer(assets.DirBrief(), nil, "", logrus.StandardLogger())

	brf.cumulative = recursiveJSON(t)

	assert.Error(t, brf.exportJSON(io.Discard))

	brf.cumulative = nil

	out := newErrorWriter(t)

	assert.Error(t, brf.exportJSON(out))
	assert.Error(t, brf.exportJSON(out.reset(1)))
	assert.Error(t, brf.exportJSON(out.reset(2)))
	assert.Error(t, brf.exportJSON(out.reset(3)))
	assert.Error(t, brf.exportJSON(out.reset(4)))

	assert.NoError(t, brf.exportJSON(out.reset(5)))
	assert.Equal(t, emptyData, out.String())
}

func Test_briefer_exportBase64_error(t *testing.T) {
	t.Parallel()

	brf := newBriefer(assets.DirBrief(), nil, "", logrus.StandardLogger())

	brf.cumulative = recursiveJSON(t)

	assert.Error(t, brf.exportBase64(io.Discard))

	brf.cumulative = nil

	out := newErrorWriter(t)

	assert.Error(t, brf.exportBase64(out))
	assert.NoError(t, brf.exportBase64(out.reset(math.MaxInt)))
	assert.Equal(t, emptyDataBase64, out.String())
}

func Test_briefer_injectData_error(t *testing.T) {
	t.Parallel()

	brf := newBriefer(assets.DirBrief(), nil, "", logrus.StandardLogger())

	file, err := assets.DirBrief().Open("index.html")

	assert.NoError(t, err)

	html, err := io.ReadAll(file)

	assert.NoError(t, err)

	out := newErrorWriter(t)

	assert.Panics(t, func() {
		brf.injectData(out, []byte{}) //nolint:errcheck
	})

	_, err = brf.injectData(out, html)

	assert.Error(t, err)

	brf.cumulative = recursiveJSON(t)
	_, err = brf.injectData(io.Discard, html)

	assert.Error(t, err)

	brf.cumulative = nil

	_, err = brf.injectData(out.reset(math.MaxInt), html)

	assert.NoError(t, err)

	assert.True(t, strings.HasSuffix(out.String(), emptyDataScript))
}

func Test_briefer_injectConfig_error(t *testing.T) {
	t.Parallel()

	brf := newBriefer(embed.FS{}, nil, "", logrus.StandardLogger())

	file, err := assets.DirBrief().Open("index.html")

	assert.NoError(t, err)

	html, err := io.ReadAll(file)

	assert.NoError(t, err)

	out := newErrorWriter(t)

	assert.Panics(t, func() {
		brf.injectConfig(out, []byte{}) //nolint:errcheck
	})

	_, err = brf.injectConfig(out, html)

	assert.Error(t, err)

	_, err = brf.injectConfig(out.reset(math.MaxInt), html)

	assert.Error(t, err)

	brf.assets = assets.DirBrief()

	_, err = brf.injectConfig(out.reset(2), html)

	assert.Error(t, err)
}

func Test_briefer_onEvent(t *testing.T) {
	t.Parallel()

	brf := newBriefer(assets.DirBrief(), nil, "", logrus.StandardLogger())

	data := make(map[string]interface{})

	brf.onEvent(snapshotEvent, data)

	assert.Equal(t, "{}\n", brf.buff.String())

	brf.onEvent(snapshotEvent, data)

	assert.Equal(t, "{}\n,{}\n", brf.buff.String())

	data["bad"] = recursiveJSON(t)

	brf.onEvent(snapshotEvent, data) // error while marshalling JSON, null will be write

	assert.Equal(t, "{}\n,{}\n,null\n", brf.buff.String())

	data["foo"] = "bar"

	brf.onEvent(cumulativeEvent, data)

	assert.Equal(t, data, brf.cumulative)
}

const (
	emptyData       = `{"cumulative":null,"snapshot":[]}`
	emptyDataBase64 = `H4sIAAAAAAAA/6pWSi7NLc1JLMksS1WyyivNydFRKs5LLCjOyC9RsoqOrQUEAAD//4mab6shAAAA`
	emptyDataScript = `<script id="data" type="application/json; charset=utf-8; gzip; base64">` + emptyDataBase64
)
