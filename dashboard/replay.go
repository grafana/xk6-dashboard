// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bufio"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/pkg/browser"
	"github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"go.k6.io/k6/metrics"
	"go.k6.io/k6/output"
)

type replayer struct {
	*eventSource

	buffer *output.SampleBuffer

	logger logrus.FieldLogger

	server *webServer

	options *options

	cumulative *meter

	timestamp time.Time

	once sync.Once
}

func replay(opts *options, uiFS fs.FS, briefFS fs.FS, filename string) error {
	config, err := opts.config()
	if err != nil {
		return err
	}

	rep := new(replayer)

	rep.options = opts
	rep.logger = logrus.StandardLogger()
	rep.eventSource = new(eventSource)

	if len(opts.Report) != 0 {
		brf := newBriefer(briefFS, config, opts.Report, rep.logger)

		rep.addEventListener(brf)
	}

	if opts.Port >= 0 {
		rep.server = newWebServer(uiFS, config, rep.logger)

		rep.addEventListener(rep.server)

		addr, err := rep.server.listenAndServe(rep.options.addr())
		if err != nil {
			return err
		}

		if rep.options.Port == 0 {
			rep.options.Port = addr.Port
		}

		if rep.options.Open {
			browser.OpenURL(rep.options.url()) // nolint:errcheck
		}
	}

	if err := rep.fireStart(); err != nil {
		return err
	}

	err = feed(filename, rep.addMetricSamples)
	if err != nil {
		return err
	}

	return rep.fireStop()
}

func (rep *replayer) addMetricSamples(samples []metrics.SampleContainer) {
	firstTime := samples[0].GetSamples()[0].Time

	rep.once.Do(func() {
		rep.cumulative = newMeter(0, firstTime)
		rep.timestamp = firstTime
		rep.buffer = new(output.SampleBuffer)
	})

	if firstTime.Sub(rep.timestamp) > rep.options.Period {
		samples := rep.buffer.GetBufferedSamples()
		now := firstTime

		rep.updateAndSend(samples, newMeter(rep.options.Period, now), snapshotEvent, now)
		rep.updateAndSend(samples, rep.cumulative, cumulativeEvent, now)

		rep.timestamp = now
	}

	rep.buffer.AddMetricSamples(samples)
}

func (rep *replayer) updateAndSend(containers []metrics.SampleContainer, m *meter, event string, now time.Time) {
	data, err := m.update(containers, now)
	if err != nil {
		rep.logger.WithError(err).Warn("Error while processing samples")

		return
	}

	rep.fireEvent(event, data)
}

type addMetricSamplesFunc func([]metrics.SampleContainer)

type feeder struct {
	input    io.Reader
	registry *registry
	callback addMetricSamplesFunc
}

func feed(filename string, callback addMetricSamplesFunc) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}

	defer file.Close()

	var input io.Reader = file

	if strings.HasSuffix(filename, ".gz") {
		gzReader, err := gzip.NewReader(file)
		if err != nil {
			return err
		}

		defer gzReader.Close()

		input = gzReader
	}

	return newFeeder(input, callback).run()
}

func newFeeder(input io.Reader, callback addMetricSamplesFunc) *feeder {
	return &feeder{ //nolint:exhaustruct
		input:    input,
		registry: newRegistry(),
		callback: callback,
	}
}

func (f *feeder) run() error {
	scanner := bufio.NewScanner(f.input)

	scanner.Split(bufio.ScanLines)

	for scanner.Scan() {
		if err := f.processLine(scanner.Bytes()); err != nil {
			return err
		}
	}

	return nil
}

func (f *feeder) processLine(data []byte) error {
	typ := gjson.GetBytes(data, "type").String()

	if typ == typeMetric {
		return f.processMetric(data)
	}

	if typ == typePoint {
		return f.processPoint(data)
	}

	return nil
}

func (f *feeder) processMetric(data []byte) error {
	var metricType metrics.MetricType

	err := metricType.UnmarshalText([]byte(gjson.GetBytes(data, "data.type").String()))
	if err != nil {
		return err
	}

	var valueType metrics.ValueType

	err = valueType.UnmarshalText([]byte(gjson.GetBytes(data, "data.contains").String()))
	if err != nil {
		return err
	}

	name := gjson.GetBytes(data, "data.name").String()

	_, err = f.registry.getOrNew(name, metricType, valueType)

	return err
}

func (f *feeder) processPoint(data []byte) error {
	timestamp := gjson.GetBytes(data, "data.time").Time()
	name := gjson.GetBytes(data, "metric").String()

	metric := f.registry.Get(name)
	if metric == nil {
		return fmt.Errorf("%w: %s", errUnknownMetric, name)
	}

	sample := metrics.Sample{ //nolint:exhaustruct
		Time:  timestamp,
		Value: gjson.GetBytes(data, "data.value").Float(),
		TimeSeries: metrics.TimeSeries{ //nolint:exhaustruct
			Metric: metric,
		},
	}

	container := metrics.ConnectedSamples{ //nolint:exhaustruct
		Samples: []metrics.Sample{sample},
		Time:    sample.Time,
	}

	f.callback([]metrics.SampleContainer{container})

	return nil
}

var errUnknownMetric = errors.New("unknown metric")
