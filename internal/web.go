// MIT License
//
// Copyright (c) 2023 Iván Szkiba
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
