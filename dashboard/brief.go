// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/sirupsen/logrus"
)

type briefer struct {
	assets fs.FS
	data   *briefData
	output string
	logger logrus.FieldLogger
	mu     sync.RWMutex
}

var (
	_ eventListener = (*briefer)(nil)
	_ http.Handler  = (*briefer)(nil)
)

func newBriefer(assets fs.FS, config json.RawMessage, output string, logger logrus.FieldLogger) *briefer {
	brf := &briefer{ // nolint:exhaustruct
		data:   newBriefData(config),
		assets: assets,
		output: output,
		logger: logger,
	}

	return brf
}

func (brf *briefer) onStart() error {
	return nil
}

func (brf *briefer) onStop() error {
	if len(brf.output) == 0 {
		return nil
	}

	file, err := os.Create(brf.output)
	if err != nil {
		return err
	}

	compress := filepath.Ext(brf.output) == ".gz"

	var out io.WriteCloser = file

	if compress {
		out = gzip.NewWriter(file)
	}

	if err := brf.exportHTML(out); err != nil {
		return err
	}

	if compress {
		if err := out.Close(); err != nil {
			return err
		}
	}

	return file.Close()
}

func (brf *briefer) onEvent(name string, data interface{}) {
	brf.mu.Lock()
	defer brf.mu.Unlock()

	if name == cumulativeEvent {
		brf.data.cumulative = data

		return
	}

	if name == paramEvent {
		brf.data.param = data

		return
	}

	if name == metricEvent {
		if metrics, ok := data.(map[string]metricData); ok {
			for key, value := range metrics {
				brf.data.metrics[key] = value
			}
		}

		return
	}

	if name != snapshotEvent {
		return
	}

	if brf.data.buff.Len() != 0 {
		if _, err := brf.data.buff.WriteRune(','); err != nil {
			brf.logger.Error(err)

			return
		}
	}

	if err := brf.data.encoder.Encode(data); err != nil {
		brf.data.encoder.Encode(nil) //nolint:errcheck,errchkjson

		brf.logger.Error(err)
	}
}

func (brf *briefer) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "text/html; charset=utf-8")

	if err := brf.exportHTML(res); err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
	}
}

func (brf *briefer) exportJSON(out io.Writer) error {
	brf.mu.RLock()
	defer brf.mu.RUnlock()

	return brf.data.exportJSON(out)
}

func (brf *briefer) exportBase64(out io.Writer) error {
	outB64 := base64.NewEncoder(base64.StdEncoding, out)
	outGZ := gzip.NewWriter(outB64)

	if err := brf.exportJSON(outGZ); err != nil {
		return err
	}

	if err := outGZ.Close(); err != nil {
		return err
	}

	return outB64.Close()
}

func (brf *briefer) exportHTML(out io.Writer) error {
	file, err := brf.assets.Open("index.html")
	if err != nil {
		return err
	}

	html, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	html, err = brf.inject(out, html, dataTag, brf.exportBase64)
	if err != nil {
		return err
	}

	if _, err := out.Write(html); err != nil {
		return err
	}

	return nil
}

func (brf *briefer) inject(out io.Writer, html []byte, tag []byte, dataFunc func(io.Writer) error) ([]byte, error) {
	idx := bytes.Index(html, tag)

	if idx < 0 {
		panic("invalid brief HTML, no tag: " + string(tag))
	}

	idx += len(tag)

	if _, err := out.Write(html[:idx]); err != nil {
		return nil, err
	}

	if err := dataFunc(out); err != nil {
		return nil, err
	}

	return html[idx:], nil
}

type briefData struct {
	config     json.RawMessage
	param      interface{}
	buff       bytes.Buffer
	encoder    *json.Encoder
	cumulative interface{}
	metrics    map[string]metricData
}

func newBriefData(config []byte) *briefData {
	data := new(briefData)

	data.config = config
	data.metrics = make(map[string]metricData)
	data.encoder = json.NewEncoder(&data.buff)

	return data
}

func encodeJSONprop(out io.Writer, prefix string, name string, value interface{}) error {
	if _, err := out.Write([]byte(prefix + `"` + name + `":`)); err != nil {
		return err
	}

	if raw, ok := value.(json.RawMessage); ok {
		if len(raw) == 0 {
			raw = []byte("null")
		}

		_, err := out.Write(raw)

		return err
	}

	bin, err := json.Marshal(value)
	if err != nil {
		return err
	}

	_, err = out.Write(bin)

	return err
}

func (data *briefData) exportJSON(out io.Writer) error {
	if err := encodeJSONprop(out, "{", "cumulative", data.cumulative); err != nil {
		return err
	}

	if err := encodeJSONprop(out, ",", "param", data.param); err != nil {
		return err
	}

	if err := encodeJSONprop(out, ",", "config", data.config); err != nil {
		return err
	}

	if err := encodeJSONprop(out, ",", "metrics", data.metrics); err != nil {
		return err
	}

	if _, err := out.Write([]byte(`,"snapshot":[`)); err != nil {
		return err
	}

	if _, err := out.Write(data.buff.Bytes()); err != nil {
		return err
	}

	_, err := out.Write([]byte("]}"))

	return err
}

var dataTag = []byte(`<script id="data" type="application/json; charset=utf-8; gzip; base64">`)
