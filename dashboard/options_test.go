package dashboard

import (
	"fmt"
	"net"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func Test_getopts_defaults(t *testing.T) {
	t.Parallel()

	opts, err := getopts("")

	assert.NoError(t, err)
	assert.NotNil(t, opts)

	assert.Equal(t, defaultHost, opts.Host)
	assert.Equal(t, defaultPort, opts.Port)
	assert.Equal(t, defaultPeriod, opts.Period)
	assert.Equal(t, defaultOpen, opts.Open)

	assert.Equal(t, fmt.Sprintf("http://%s", net.JoinHostPort("127.0.0.1", strconv.Itoa(defaultPort))), opts.url())
}

func Test_getopts_error(t *testing.T) {
	t.Parallel()

	_, err := getopts("period=s")

	assert.Error(t, err)
}

func Test_getopts(t *testing.T) {
	t.Parallel()

	opts, err := getopts("period=1s&port=1&host=localhost&open")

	assert.NoError(t, err)
	assert.Equal(t, time.Second, opts.Period)
	assert.Equal(t, 1, opts.Port)
	assert.True(t, opts.Open)
	assert.Equal(t, "localhost", opts.Host)
	assert.Equal(t, "http://localhost:1", opts.url())
	assert.Equal(t, "localhost:1", opts.addr())
}
