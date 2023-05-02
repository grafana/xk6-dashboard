package dashboard

import (
	"net/http"
	"testing"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/szkiba/xk6-dashboard/ui"
)

func Test_newWebServer(t *testing.T) {
	t.Parallel()

	srv := newWebServer(ui.GetFS(), logrus.StandardLogger())

	assert.NotNil(t, srv)
	assert.NotNil(t, srv.ServeMux)
	assert.NotNil(t, srv.eventSource)

	addr := getRandomAddr(t)

	assert.NoError(t, srv.listenAndServe(addr))

	base := "http://" + addr

	testLoc := func(loc string) {
		res, err := http.Get(base + loc) // nolint:bodyclose,noctx

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, res.StatusCode)
	}

	testLoc("/ui/index.html")
	testLoc("/events")
	testLoc("/")

	res, err := http.Get(base + "/no_such_path") // nolint:bodyclose,noctx

	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, res.StatusCode)
}

func Test_webServer_used_addr(t *testing.T) {
	t.Parallel()

	srv := newWebServer(ui.GetFS(), logrus.StandardLogger())

	addr := getRandomAddr(t)

	assert.NoError(t, srv.listenAndServe(addr))
	assert.Error(t, srv.listenAndServe(addr))
}
