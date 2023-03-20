// MIT License
//
// Copyright (c) 2021 Iván Szkiba
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
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/gorilla/schema"
	"github.com/prometheus/client_golang/prometheus"
	"go.k6.io/k6/output"
)

const (
	pathEvents     = "/events/sample"
	pathMetrics    = "/api/metrics"
	pathPrometheus = "/api/prometheus"
	pathUI         = "/ui/"
	defaultHost    = ""
	defaultPort    = 5665
	defaultPeriod  = 10
	defaultUI      = ""
)

type options struct {
	Port   int
	Host   string
	Period int
}

type Output struct {
	*PrometheusAdapter
	*EventExporter
	*http.ServeMux

	flusher *output.PeriodicFlusher

	params output.Params

	description string
}

func New(params output.Params, uiFS fs.FS) (output.Output, error) { //nolint:ireturn
	registry := prometheus.NewRegistry()
	instance := &Output{
		PrometheusAdapter: NewPrometheusAdapter(registry, params.Logger, "", ""),
		EventExporter:     NewEvenExporter(registry, pathEvents, params.Logger),
		ServeMux:          http.DefaultServeMux,
		params:            params,
		flusher:           nil,
	}

	instance.Handle(pathEvents, instance.EventExporter.Handler())
	instance.HandleFunc(pathMetrics, instance.EventExporter.MetricsHandlerFunc())
	instance.Handle(pathPrometheus, instance.PrometheusAdapter.Handler())
	instance.HandleFunc("/", rootHandler(pathUI, uiFS))

	return instance, nil
}

func (o *Output) Description() string {
	return o.description
}

func getopts(query string) (*options, error) {
	opts := &options{
		Port:   defaultPort,
		Host:   defaultHost,
		Period: defaultPeriod,
	}

	if query == "" {
		return opts, nil
	}

	value, err := url.ParseQuery(query)
	if err != nil {
		return nil, err
	}

	decoder := schema.NewDecoder()

	if err = decoder.Decode(opts, value); err != nil {
		return nil, err
	}

	return opts, nil
}

func (o *Output) Start() error {
	opts, err := getopts(o.params.ConfigArgument)
	if err != nil {
		return err
	}

	addr := fmt.Sprintf("%s:%d", opts.Host, opts.Port)

	host := opts.Host
	if host == "" {
		host = "127.0.0.1"
	}

	o.description = fmt.Sprintf("dashboard (%s) http://%s:%d", addr, host, opts.Port) // nolint:nosprintfhostport

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	go func() {
		if err := http.Serve(listener, o); err != nil {
			o.params.Logger.Error(err)
		}
	}()

	o.flusher, err = output.NewPeriodicFlusher(time.Duration(opts.Period)*time.Second, o.EventExporter.Flush)
	if err != nil {
		return err
	}

	return nil
}

func (o *Output) Stop() error {
	o.flusher.Stop()

	return nil
}

func rootHandler(uiPath string, uiFS fs.FS) http.HandlerFunc {
	uiHandler := http.StripPrefix(uiPath, http.FileServer(http.FS(uiFS)))

	return func(w http.ResponseWriter, r *http.Request) { //nolint:varnamelen
		if r.URL.Path == "/" || r.URL.Path == "/favicon.ico" {
			http.Redirect(w, r, path.Join(uiPath, r.URL.Path), http.StatusTemporaryRedirect)

			return
		}

		if strings.HasPrefix(r.URL.Path, uiPath) {
			uiHandler.ServeHTTP(w, r)

			return
		}

		http.NotFound(w, r)
	}
}
