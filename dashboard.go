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

package dashboard

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gorilla/schema"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
	"github.com/szkiba/xk6-dashboard/internal"
	"go.k6.io/k6/output"
)

// Register the extensions on module initialization.
func init() {
	output.RegisterExtension("dashboard", New)
}

const (
	pathEvents     = "/events/sample"
	pathMetrics    = "/api/metrics"
	pathPrometheus = "/api/prometheus"
	dirUI          = "assets/ui"
	pathUI         = "/ui/"
	defaultHost    = ""
	defaultPort    = 5665
	defaultPeriod  = 10
	defaultUI      = ""
	paramEndpoint  = "endpoint"
)

type options struct {
	Port   int
	Host   string
	Period int
	UI     string
}

func (o *options) isDefaultUI() bool {
	return o.UI == defaultUI
}

func (o *options) isLocalUI() bool {
	return !strings.HasPrefix(o.UI, "http://") && !strings.HasPrefix(o.UI, "https://")
}

type Output struct {
	*internal.PrometheusAdapter
	*internal.EventExporter

	flusher *output.PeriodicFlusher
	addr    string
	arg     string
	url     string
	logger  logrus.FieldLogger
}

func New(params output.Params) (output.Output, error) { //nolint:ireturn
	registry := prometheus.NewRegistry()
	instance := &Output{
		PrometheusAdapter: internal.NewPrometheusAdapter(registry, params.Logger, "", ""),
		EventExporter:     internal.NewEvenExporter(registry, pathEvents, params.Logger),
		arg:               params.ConfigArgument,
		logger:            params.Logger,
		flusher:           nil,
		addr:              "",
		url:               "",
	}

	return instance, nil
}

func (o *Output) Description() string {
	return fmt.Sprintf("dashboard (%s) %s", o.addr, o.url)
}

func getopts(query string) (*options, error) {
	opts := &options{
		Port:   defaultPort,
		Host:   defaultHost,
		Period: defaultPeriod,
		UI:     defaultUI,
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

func (o *Output) handler(opts *options) (http.Handler, error) {
	mux := http.NewServeMux()
	mux.Handle(pathEvents, o.EventExporter.Handler())
	mux.HandleFunc(pathMetrics, o.EventExporter.MetricsHandlerFunc())
	mux.Handle(pathPrometheus, o.PrometheusAdapter.Handler())

	handler, err := uiHandler(opts)
	if err != nil {
		return nil, err
	}

	mux.Handle(pathUI, handler)
	mux.HandleFunc("/", rootHandler(opts))

	return mux, nil
}

func (o *Output) Start() error {
	opts, err := getopts(o.arg)
	if err != nil {
		return err
	}

	o.addr = fmt.Sprintf("%s:%d", opts.Host, opts.Port)

	host := opts.Host
	if host == "" {
		host = "localhost"
	}

	o.url = fmt.Sprintf("http://%s:%d", host, opts.Port) // nolint:nosprintfhostport

	listener, err := net.Listen("tcp", o.addr)
	if err != nil {
		return err
	}

	handler, err := o.handler(opts)
	if err != nil {
		return err
	}

	go func() {
		if err := http.Serve(listener, handler); err != nil {
			o.logger.Error(err)
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

//go:embed assets/ui
var ui embed.FS

func defaultUIHandler() (http.Handler, error) {
	uiFS, err := fs.Sub(ui, dirUI)
	if err != nil {
		return nil, err
	}

	return http.StripPrefix(pathUI, http.FileServer(http.FS(uiFS))), nil
}

func fileServer(dir string) (http.Handler, error) {
	return http.FileServer(http.Dir(dir)), nil
}

func uiHandler(opts *options) (http.Handler, error) {
	if opts.isDefaultUI() {
		return defaultUIHandler()
	}

	if opts.isLocalUI() {
		return fileServer(opts.UI)
	}

	uiURL, err := url.Parse(opts.UI)
	if err != nil {
		return nil, err
	}

	if uiURL.Scheme == "" {
		return http.FileServer(http.Dir(opts.UI)), nil
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { //nolint:varnamelen
		location, err := url.Parse(opts.UI)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)

			return
		}

		values := location.Query()

		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}

		path := strings.TrimSuffix(r.URL.Path, pathUI)

		values.Add(paramEndpoint, fmt.Sprintf("%s://%s%s/", scheme, r.Host, path))

		location.RawQuery = values.Encode()

		http.Redirect(w, r, location.String(), http.StatusTemporaryRedirect)
	}), nil
}

func rootHandler(opts *options) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) { //nolint:varnamelen
		if r.URL.Path != "/" {
			http.NotFound(w, r)

			return
		}

		http.Redirect(w, r, pathUI, http.StatusTemporaryRedirect)
	}
}
