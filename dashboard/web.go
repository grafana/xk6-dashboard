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
	*eventSource
	*http.ServeMux
}

func newWebServer(uiFS fs.FS, logger logrus.FieldLogger) *webServer { //nolint:ireturn
	srv := &webServer{
		eventSource: newEventSource(eventChannel, logger),
		ServeMux:    http.NewServeMux(),
	}

	uiHandler := http.StripPrefix(pathUI, http.FileServer(http.FS(uiFS)))

	srv.Handle(pathEvents, srv.eventSource)
	srv.Handle(pathUI, uiHandler)
	srv.HandleFunc("/", rootHandler(pathUI))

	return srv
}

func (srv *webServer) listenAndServe(addr string) error {
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
		if r.URL.Path == "/" {
			http.Redirect(w, r, path.Join(uiPath, r.URL.Path)+"?endpoint=/", http.StatusTemporaryRedirect)

			return
		}

		http.NotFound(w, r)
	}
}
