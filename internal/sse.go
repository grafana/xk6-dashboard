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
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/alexandrevicenzi/go-sse"
	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
	"github.com/sirupsen/logrus"
)

type metric struct {
	Type string `json:"type,omitempty"`
	Help string `json:"help,omitempty"`
}

type EventExporter struct {
	sse      *sse.Server
	logger   logrus.FieldLogger
	registry *prometheus.Registry
	metrics  map[string]*metric
	channel  string
}

func NewEvenExporter(registry *prometheus.Registry, channel string, logger logrus.FieldLogger) *EventExporter {
	e := &EventExporter{
		registry: registry,
		channel:  channel,
		logger:   logger,
		metrics:  make(map[string]*metric),
		sse: sse.NewServer(&sse.Options{
			Headers: map[string]string{
				"Access-Control-Allow-Origin": "*",
			},
			RetryInterval:   0,
			ChannelNameFunc: nil,
			Logger:          nil,
		}),
	}

	return e
}

func (e *EventExporter) Handler() http.Handler {
	return e.sse
}

func (e *EventExporter) MetricsHandlerFunc() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		b, err := json.Marshal(e.metrics)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)

			return
		}

		w.Header().Add("Content-Type", "application/json; charset=utf-8")
		w.Header().Add("Cache-Control", "no-cache")
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Write(b) //nolint:errcheck
	}
}

func (e *EventExporter) Flush() {
	all, err := e.registry.Gather()
	if err != nil {
		panic(err)
	}

	data := map[string]float64{}

	for _, m := range all {
		e.addMetric(m)
		e.addSample(data, m)
	}

	b, err := json.Marshal(data)
	if err != nil {
		e.logger.Error(err)

		return
	}

	if e.sse.HasChannel(e.channel) {
		e.sse.SendMessage(e.channel, sse.SimpleMessage(string(b)))
	}
}

func (e *EventExporter) addSample(data map[string]float64, mf *dto.MetricFamily) {
	name := *mf.Name

	switch *mf.Type {
	case dto.MetricType_COUNTER:
		data[name] = *mf.Metric[0].Counter.Value
	case dto.MetricType_GAUGE:
		data[name] = *mf.Metric[0].Gauge.Value
	case dto.MetricType_SUMMARY:
		for _, q := range mf.Metric[0].Summary.GetQuantile() {
			if *q.Value == 0.0 {
				continue
			}

			name := name
			if *q.Quantile < 1.0 {
				name = fmt.Sprintf("%s_%2.0f", name, *q.Quantile*percent)
			}

			data[name] = *q.Value
		}
	case dto.MetricType_HISTOGRAM:
	case dto.MetricType_UNTYPED:
	}
}

func (e *EventExporter) addMetric(mf *dto.MetricFamily) {
	if _, ok := e.metrics[*mf.Name]; ok {
		return
	}

	e.metrics[*mf.Name] = &metric{
		Type: strings.ToLower(mf.Type.String()),
		Help: *mf.Help,
	}
}

const percent = 100
