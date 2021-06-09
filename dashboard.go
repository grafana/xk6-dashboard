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
	"bytes"
	_ "embed" // nolint
	"fmt"
	"html/template"
	"net"
	"net/http"
	"net/url"
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
	defaultPort    = 5665
	defaultPeriod  = 10
	defaultUI      = "https://xk6-dashboard.netlify.app/"
)

type options struct {
	Port   int
	Host   string
	Period int
	UI     string
}

type Output struct {
	*internal.PrometheusAdapter
	*internal.EventExporter

	flusher *output.PeriodicFlusher
	addr    string
	arg     string
	logger  logrus.FieldLogger
}

func New(params output.Params) (output.Output, error) {
	registry := prometheus.NewRegistry()
	o := &Output{
		PrometheusAdapter: internal.NewPrometheusAdapter(registry, params.Logger, "", ""),
		EventExporter:     internal.NewEvenExporter(registry, pathEvents, params.Logger),
		arg:               params.ConfigArgument,
		logger:            params.Logger,
		flusher:           nil,
		addr:              "",
	}

	return o, nil
}

func (o *Output) Description() string {
	return fmt.Sprintf("dashboard (%s)", o.addr)
}

func getopts(qs string) (*options, error) {
	opts := &options{
		Port:   defaultPort,
		Host:   "",
		Period: defaultPeriod,
		UI:     defaultUI,
	}

	if qs == "" {
		return opts, nil
	}

	v, err := url.ParseQuery(qs)
	if err != nil {
		return nil, err
	}

	decoder := schema.NewDecoder()

	if err = decoder.Decode(opts, v); err != nil {
		return nil, err
	}

	return opts, nil
}

func (o *Output) handler(opts *options) (http.Handler, error) {
	tmpl, err := template.New("index.html").Parse(index)
	if err != nil {
		return nil, err
	}

	mux := http.NewServeMux()
	mux.Handle(pathEvents, o.EventExporter.Handler())
	mux.HandleFunc(pathMetrics, o.EventExporter.MetricsHandlerFunc())
	mux.Handle(pathPrometheus, o.PrometheusAdapter.Handler())

	u, err := url.Parse(opts.UI)
	if err != nil {
		return nil, err
	}

	if u.Scheme == "" {
		u.Scheme = "https"
	}

	var buff bytes.Buffer

	err = tmpl.Execute(&buff, map[string]string{"ui": u.String()})
	if err != nil {
		return nil, err
	}

	page := buff.Bytes()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)

			return
		}

		w.Write(page) // nolint:errcheck
	})

	return mux, nil
}

func (o *Output) Start() error {
	opts, err := getopts(o.arg)
	if err != nil {
		return err
	}

	o.addr = fmt.Sprintf("%s:%d", opts.Host, opts.Port)

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

//go:embed index.html
var index string
