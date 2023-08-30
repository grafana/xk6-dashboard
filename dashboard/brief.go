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
	assets     fs.FS
	uiConfig   []byte
	output     string
	logger     logrus.FieldLogger
	buff       bytes.Buffer
	mu         sync.RWMutex
	encoder    *json.Encoder
	cumulative interface{}
	metrics    map[string]metricData
	param      interface{}
}

var (
	_ eventListener = (*briefer)(nil)
	_ http.Handler  = (*briefer)(nil)
)

func newBriefer(assets fs.FS, uiConfig []byte, output string, logger logrus.FieldLogger) *briefer {
	brf := &briefer{ // nolint:exhaustruct
		assets:   assets,
		uiConfig: uiConfig,
		output:   output,
		logger:   logger,
		metrics:  make(map[string]metricData),
	}

	brf.encoder = json.NewEncoder(&brf.buff)

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
		brf.cumulative = data

		return
	}

	if name == paramEvent {
		brf.param = data

		return
	}

	if name == metricEvent {
		if metrics, ok := data.(map[string]metricData); ok {
			for key, value := range metrics {
				brf.metrics[key] = value
			}
		}

		return
	}

	if name != snapshotEvent {
		return
	}

	if brf.buff.Len() != 0 {
		if _, err := brf.buff.WriteRune(','); err != nil {
			brf.logger.Error(err)

			return
		}
	}

	if err := brf.encoder.Encode(data); err != nil {
		brf.encoder.Encode(nil) //nolint:errcheck,errchkjson

		brf.logger.Error(err)
	}
}

func (brf *briefer) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "text/html; charset=utf-8")

	if err := brf.exportHTML(res); err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
	}
}

func encodeJSON(out io.Writer, data interface{}) error {
	bin, err := json.Marshal(data)
	if err != nil {
		return err
	}

	_, err = out.Write(bin)

	return err
}

func (brf *briefer) exportJSON(out io.Writer) error {
	brf.mu.RLock()
	defer brf.mu.RUnlock()

	if _, err := out.Write([]byte(`{"cumulative":`)); err != nil {
		return err
	}

	if err := encodeJSON(out, brf.cumulative); err != nil {
		return err
	}

	if _, err := out.Write([]byte(`,"param":`)); err != nil {
		return err
	}

	if err := encodeJSON(out, brf.param); err != nil {
		return err
	}

	if _, err := out.Write([]byte(`,"metrics":`)); err != nil {
		return err
	}

	if err := encodeJSON(out, brf.metrics); err != nil {
		return err
	}

	if _, err := out.Write([]byte(`,"snapshot":[`)); err != nil {
		return err
	}

	if _, err := out.Write(brf.buff.Bytes()); err != nil {
		return err
	}

	_, err := out.Write([]byte("]}"))

	return err
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

	html, err = brf.inject(out, html, configTag, brf.exportConfig)
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

func (brf *briefer) exportConfig(out io.Writer) error {
	_, err := out.Write(brf.uiConfig)

	return err
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

var (
	configTag = []byte(`<script id="config" type="application/json; charset=utf-8">`)
	dataTag   = []byte(`<script id="data" type="application/json; charset=utf-8; gzip; base64">`)
)
