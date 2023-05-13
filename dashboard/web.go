// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"io/fs"
	"net"
	"net/http"
	"os"
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
	*eventSource
	*http.ServeMux
}

func newWebServer(uiFS fs.FS, uiConfig string, logger logrus.FieldLogger) *webServer { //nolint:ireturn
	srv := &webServer{
		eventSource: newEventSource(eventChannel, logger),
		ServeMux:    http.NewServeMux(),
	}

	srv.Handle(pathEvents, srv.eventSource)
	srv.HandleFunc(pathUI, uiHandler(pathUI, uiFS, uiConfig, logger))
	srv.HandleFunc("/", rootHandler(pathUI))

	return srv
}

func (srv *webServer) listenAndServe(addr string) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	go func() {
		server := &http.Server{Handler: srv.ServeMux, ReadHeaderTimeout: time.Second} //nolint:exhaustruct

		if err := server.Serve(listener); err != nil {
			srv.logger.Error(err)
		}
	}()

	return nil
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

func uiHandler(uiPath string, uiFS fs.FS, uiConfig string, logger logrus.FieldLogger) http.HandlerFunc {
	handler := http.StripPrefix(uiPath, http.FileServer(http.FS(uiFS)))

	if len(uiConfig) == 0 {
		return handler.ServeHTTP
	}

	return func(res http.ResponseWriter, req *http.Request) {
		if req.URL.Path != uiPath+"config.js" {
			handler.ServeHTTP(res, req)

			return
		}

		// try to read on every request to allow dynamic reload
		content, err := os.ReadFile(uiConfig)
		if err != nil {
			logger.WithError(err).Debugf("ignoring ui config file: %s", uiConfig)

			handler.ServeHTTP(res, req)

			return
		}

		res.Header().Set("Content-Type", "text/javascript; charset=utf-8")
		res.WriteHeader(http.StatusOK)
		res.Write(content) // nolint:errcheck
	}
}
