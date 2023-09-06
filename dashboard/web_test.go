// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"net/http"
	"testing"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func Test_newWebServer(t *testing.T) {
	t.Parallel()

	srv := newWebServer(testDirUI(t), http.NotFoundHandler(), logrus.StandardLogger())

	assert.NotNil(t, srv)
	assert.NotNil(t, srv.ServeMux)
	assert.NotNil(t, srv.eventEmitter)

	addr, err := srv.listenAndServe("127.0.0.1:0")

	assert.NoError(t, err)

	base := "http://" + addr.String()

	testLoc := func(loc string) {
		res, eerr := http.Get(base + loc) //nolint:bodyclose,noctx

		assert.NoError(t, eerr)
		assert.Equal(t, http.StatusOK, res.StatusCode)
	}

	testLoc("/ui/index.html")
	testLoc("/events")
	testLoc("/")

	res, err := http.Get(base + "/no_such_path") //nolint:bodyclose,noctx

	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, res.StatusCode)
}

func Test_webServer_used_addr(t *testing.T) {
	t.Parallel()

	srv := newWebServer(testDirUI(t), http.NotFoundHandler(), logrus.StandardLogger())

	addr, err := srv.listenAndServe("127.0.0.1:0")

	assert.NoError(t, err)

	_, err = srv.listenAndServe(addr.String())

	assert.Error(t, err)
}
