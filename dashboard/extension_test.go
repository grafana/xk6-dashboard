package dashboard

import (
	"embed"
	"testing"

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
	assert.Equal(t, "http://localhost:1", ext.URL())

	params.ConfigArgument = "period=2"

	_, err = New(params, embed.FS{})

	assert.Error(t, err)
}

func TestExtension(t *testing.T) {
	t.Parallel()

	var params output.Params

	params.Logger = logrus.StandardLogger()

	ext, err := New(params, embed.FS{})

	assert.NoError(t, err)
	assert.NotNil(t, ext)

	assert.NoError(t, ext.Start())

	sample := testSample(t, "foo", metrics.Counter, 1)

	ext.AddMetricSamples(testSampleContainer(t, sample).toArray())

	assert.NoError(t, ext.Stop())
}
