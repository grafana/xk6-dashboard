// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"strings"
	"sync"
	"time"

	"github.com/pkg/browser"
	"github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"go.k6.io/k6/lib/fsext"
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

	config json.RawMessage

	seenMetrics map[string]struct{}
}

func replay(
	opts *options,
	uiConfig json.RawMessage,
	uiFS fs.FS,
	briefFS fs.FS,
	filename string,
	osFS fsext.Fs,
) error {
	logger := logrus.StandardLogger()
	rep := new(replayer)

	rep.options = opts
	rep.config = uiConfig
	rep.logger = logger
	rep.eventSource = new(eventSource)
	rep.seenMetrics = make(map[string]struct{})

	brf := newBriefer(briefFS, rep.config, opts.Report, osFS, rep.logger)

	rep.addEventListener(brf)

	if opts.Port >= 0 {
		rep.server = newWebServer(uiFS, brf, rep.logger)

		rep.addEventListener(rep.server)

		addr, err := rep.server.listenAndServe(rep.options.addr())
		if err != nil {
			return err
		}

		if rep.options.Port == 0 {
			rep.options.Port = addr.Port
		}

		if rep.options.Open {
			_ = browser.OpenURL(rep.options.url())
		}
	}

	if err := rep.start(); err != nil {
		return err
	}

	if err := feed(filename, osFS, rep.addMetricSamples, logger); err != nil {
		return err
	}

	return rep.stop()
}

func (rep *replayer) start() error {
	now := time.Now()

	rep.fireEvent(configEvent, rep.config)

	param := new(paramData)

	param.Period = time.Duration(rep.options.Period.Milliseconds())

	rep.fireEvent(paramEvent, param)

	rep.updateAndSend(nil, newMeter(rep.options.Period, now, rep.options.Tags), startEvent, now)

	return rep.fireStart()
}

func (rep *replayer) stop() error {
	now := time.Now()

	rep.updateAndSend(nil, newMeter(rep.options.Period, now, rep.options.Tags), stopEvent, now)

	return rep.fireStop()
}

func (rep *replayer) addMetricSamples(samples []metrics.SampleContainer) {
	firstTime := samples[0].GetSamples()[0].Time

	rep.once.Do(func() {
		rep.cumulative = newMeter(0, firstTime, rep.options.Tags)
		rep.timestamp = firstTime
		rep.buffer = new(output.SampleBuffer)
	})

	if firstTime.Sub(rep.timestamp) > rep.options.Period {
		samples = rep.buffer.GetBufferedSamples()
		now := firstTime

		rep.updateAndSend(
			samples,
			newMeter(rep.options.Period, now, rep.options.Tags),
			snapshotEvent,
			now,
		)
		rep.updateAndSend(samples, rep.cumulative, cumulativeEvent, now)

		rep.timestamp = now
	}

	rep.buffer.AddMetricSamples(samples)
}

func (rep *replayer) updateAndSend(
	containers []metrics.SampleContainer,
	met *meter,
	event string,
	now time.Time,
) {
	data, err := met.update(containers, now)
	if err != nil {
		rep.logger.WithError(err).Warn("Error while processing samples")

		return
	}

	newbies := met.newbies(rep.seenMetrics)
	if len(newbies) != 0 {
		rep.fireEvent(metricEvent, newbies)
	}

	rep.fireEvent(event, data)
}

type addMetricSamplesFunc func([]metrics.SampleContainer)

type feeder struct {
	input    io.Reader
	registry *registry
	callback addMetricSamplesFunc
}

func feed(
	filename string,
	fs fsext.Fs,
	callback addMetricSamplesFunc,
	logger logrus.FieldLogger,
) error {
	file, err := fs.Open(filename)
	if err != nil {
		return err
	}

	closer := func(what io.Closer) {
		if closeErr := what.Close(); closeErr != nil {
			logger.Error(err)
		}
	}

	defer closer(file)

	var input io.Reader = file

	if strings.HasSuffix(filename, ".gz") {
		gzReader, err := gzip.NewReader(file)
		if err != nil {
			return err
		}

		defer closer(gzReader)

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

	tags := f.tagSetFrom(gjson.GetBytes(data, "data.tags"))

	sample := metrics.Sample{ //nolint:exhaustruct
		Time:  timestamp,
		Value: gjson.GetBytes(data, "data.value").Float(),
		TimeSeries: metrics.TimeSeries{ //nolint:exhaustruct
			Metric: metric,
			Tags:   tags,
		},
	}

	container := metrics.ConnectedSamples{ //nolint:exhaustruct
		Samples: []metrics.Sample{sample},
		Time:    sample.Time,
		Tags:    tags,
	}

	f.callback([]metrics.SampleContainer{container})

	return nil
}

func (f *feeder) tagSetFrom(res gjson.Result) *metrics.TagSet {
	asMap := res.Map()
	if len(asMap) == 0 {
		return nil
	}

	set := f.registry.Registry.RootTagSet()

	for key, value := range asMap {
		set = set.With(key, value.String())
	}

	return set
}

var errUnknownMetric = errors.New("unknown metric")
