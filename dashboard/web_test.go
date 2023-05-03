package dashboard

import (
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/szkiba/xk6-dashboard/ui"
)

func Test_newWebServer(t *testing.T) {
	t.Parallel()

	srv := newWebServer(ui.GetFS(), "", logrus.StandardLogger())

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

	srv := newWebServer(ui.GetFS(), "", logrus.StandardLogger())

	addr := getRandomAddr(t)

	assert.NoError(t, srv.listenAndServe(addr))
	assert.Error(t, srv.listenAndServe(addr))
}

func Test_uiHandler_no_config(t *testing.T) {
	t.Parallel()

	handler := uiHandler("/foo/", ui.GetFS(), "", logrus.StandardLogger())

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/foo/config.js", nil)

	handler(rec, req)

	res := rec.Result() // nolint:bodyclose

	assert.Equal(t, http.StatusOK, res.StatusCode)
	assert.Contains(t, res.Header.Get("Content-Type"), "/javascript")

	body, err := io.ReadAll(res.Body)

	assert.NoError(t, err)
	assert.Equal(t, "export default defaultConfig\n", string(body))
}

func Test_uiHandler_missing_config(t *testing.T) {
	t.Parallel()

	handler := uiHandler("/foo/", ui.GetFS(), "no-such-file", logrus.StandardLogger())

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/foo/config.js", nil)

	handler(rec, req)

	res := rec.Result() // nolint:bodyclose

	assert.Equal(t, http.StatusOK, res.StatusCode)
	assert.Contains(t, res.Header.Get("Content-Type"), "/javascript")

	body, err := io.ReadAll(res.Body)

	assert.NoError(t, err)
	assert.Equal(t, "export default defaultConfig", strings.TrimSpace(string(body)))
}

func Test_uiHandler(t *testing.T) {
	t.Parallel()

	handler := uiHandler("/foo/", ui.GetFS(), filepath.Join("..", ".dashboard.js"), logrus.StandardLogger())

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/foo/config.js", nil)

	handler(rec, req)

	res := rec.Result() // nolint:bodyclose

	assert.Equal(t, http.StatusOK, res.StatusCode)
	assert.Contains(t, res.Header.Get("Content-Type"), "/javascript")

	body, err := io.ReadAll(res.Body)

	assert.NoError(t, err)
	assert.NotEmpty(t, body)
	assert.NotEqual(t, "export default defaultConfig", strings.TrimSpace(string(body)))

	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/foo/init.js", nil)

	handler(rec, req)

	res = rec.Result() // nolint:bodyclose

	assert.Equal(t, http.StatusOK, res.StatusCode)
}
