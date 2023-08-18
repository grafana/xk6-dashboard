// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"io/fs"
	"net"
	"net/http"
	"path"
	"time"

	"github.com/sirupsen/logrus"
)

const (
	pathEvents = "/events"
	pathUI     = "/ui/"

	eventChannel    = "events"
	snapshotEvent   = "snapshot"
	cumulativeEvent = "cumulative"
)

type webServer struct {
	*eventEmitter
	*http.ServeMux
}

func newWebServer(uiFS fs.FS, uiConfig []byte, logger logrus.FieldLogger) *webServer { //nolint:ireturn
	srv := &webServer{
		eventEmitter: newEventEmitter(eventChannel, logger),
		ServeMux:     http.NewServeMux(),
	}

	srv.Handle(pathEvents, srv.eventEmitter)
	srv.HandleFunc(pathUI, uiHandler(pathUI, uiFS, uiConfig))
	srv.HandleFunc("/", rootHandler(pathUI))

	return srv
}

func (srv *webServer) listenAndServe(addr string) (*net.TCPAddr, error) {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, err
	}

	go func() {
		server := &http.Server{Handler: srv.ServeMux, ReadHeaderTimeout: time.Second} //nolint:exhaustruct

		if err := server.Serve(listener); err != nil {
			srv.logger.Error(err)
		}
	}()

	a, _ := listener.Addr().(*net.TCPAddr)

	return a, nil
}

func rootHandler(uiPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) { //nolint:varnamelen
		if r.URL.Path == "/" {
			http.Redirect(w, r, path.Join(uiPath, r.URL.Path)+"?endpoint=/", http.StatusTemporaryRedirect)

			return
		}

		http.NotFound(w, r)
	}
}

func uiHandler(uiPath string, uiFS fs.FS, uiConfig []byte) http.HandlerFunc {
	handler := http.StripPrefix(uiPath, http.FileServer(http.FS(uiFS)))

	if len(uiConfig) == 0 {
		return handler.ServeHTTP
	}

	return func(res http.ResponseWriter, req *http.Request) {
		if req.URL.Path != uiPath+"config.js" {
			handler.ServeHTTP(res, req)

			return
		}

		res.Header().Set("Content-Type", "text/javascript; charset=utf-8")
		res.WriteHeader(http.StatusOK)
		res.Write(uiConfig) // nolint:errcheck
	}
}
