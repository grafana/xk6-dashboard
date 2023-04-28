// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package internal

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

type WebServer struct {
	*EventSource
	*http.ServeMux
}

func NewWebServer(uiFS fs.FS, logger logrus.FieldLogger) (*WebServer, error) { //nolint:ireturn
	srv := &WebServer{
		EventSource: NewEventSource(eventChannel, logger),
		ServeMux:    http.NewServeMux(),
	}

	uiHandler := http.StripPrefix(pathUI, http.FileServer(http.FS(uiFS)))

	srv.Handle(pathEvents, srv.EventSource)
	srv.Handle(pathUI, uiHandler)
	srv.HandleFunc("/", rootHandler(pathUI))

	return srv, nil
}

func (srv *WebServer) ListenAndServe(addr string) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	go func() {
		server := &http.Server{Handler: srv, ReadHeaderTimeout: time.Second} //nolint:exhaustruct

		if err := server.Serve(listener); err != nil {
			srv.logger.Error(err)
		}
	}()

	return nil
}

func rootHandler(uiPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) { //nolint:varnamelen
		if r.URL.Path == "/" || r.URL.Path == "/favicon.ico" {
			http.Redirect(w, r, path.Join(uiPath, r.URL.Path)+"?endpoint=/", http.StatusTemporaryRedirect)

			return
		}

		http.NotFound(w, r)
	}
}
