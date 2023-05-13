package dashboard

import (
	"embed"
	"net"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"go.k6.io/k6/metrics"
	"go.k6.io/k6/output"
)

func TestNewExtension(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.ConfigArgument = "port=1&host=localhost"
	params.OutputType = "dashboard"

	ext, err := New(params, embed.FS{})

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.Equal(t, "dashboard (localhost:1) http://localhost:1", ext.Description())

	params.ConfigArgument = "period=2"

	_, err = New(params, embed.FS{})

	assert.Error(t, err)
}

func TestExtension(t *testing.T) {
	t.Parallel()

	port := getRandomPort(t)
	addr := net.JoinHostPort("127.0.0.1", strconv.Itoa(port))

	var params output.Params

	params.Logger = logrus.StandardLogger()
	params.ConfigArgument = "period=10ms&port=" + strconv.Itoa(port)

	ext, err := New(params, embed.FS{})

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	time.Sleep(time.Millisecond)

	go func() {
		sample := testSample(t, "foo", metrics.Counter, 1)

		ext.AddMetricSamples(testSampleContainer(t, sample).toArray())
	}()

	lines := readSSE(t, 7, "http://"+addr+"/events")

	assert.NotNil(t, lines)
	assert.Equal(t, "event: snapshot", lines[2])
	assert.Equal(t, "event: cumulative", lines[6])

	dataPrefix := `data: {"foo":{"type":"counter","contains":"default","tainted":null,"sample":{"count":1,"rate":`

	assert.True(t, strings.HasPrefix(lines[1], dataPrefix))
	assert.True(t, strings.HasPrefix(lines[5], dataPrefix))

	assert.NoError(t, ext.Stop())
}
