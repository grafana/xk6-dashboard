// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"path/filepath"
	"sync"
)

type reporter struct {
	assets *assets
	proc   *process

	data   *reportData
	output string
	mu     sync.RWMutex
}

var (
	_ eventListener = (*reporter)(nil)
	_ http.Handler  = (*reporter)(nil)
)

func newReporter(output string, assets *assets, proc *process) *reporter {
	rep := &reporter{ //nolint:exhaustruct
		data:   newReportData(assets.config),
		assets: assets,
		proc:   proc,
		output: output,
	}

	return rep
}

func (rep *reporter) onStart() error {
	return nil
}

func (rep *reporter) onStop() error {
	if len(rep.output) == 0 {
		return nil
	}

	file, err := rep.proc.fs.Create(rep.output)
	if err != nil {
		return err
	}

	compress := filepath.Ext(rep.output) == ".gz"

	var out io.WriteCloser = file

	if compress {
		out = gzip.NewWriter(file)
	}

	if err := rep.exportHTML(out); err != nil {
		return err
	}

	if compress {
		if err := out.Close(); err != nil {
			return err
		}
	}

	return file.Close()
}

func (rep *reporter) onEvent(name string, data interface{}) {
	rep.mu.Lock()
	defer rep.mu.Unlock()

	if name == cumulativeEvent {
		rep.data.cumulative = data

		return
	}

	if name == paramEvent {
		rep.data.param = data

		return
	}

	if name == metricEvent {
		if metrics, ok := data.(map[string]metricData); ok {
			for key, value := range metrics {
				rep.data.metrics[key] = value
			}
		}

		return
	}

	if name != snapshotEvent {
		return
	}

	if rep.data.buff.Len() != 0 {
		if _, err := rep.data.buff.WriteRune(','); err != nil {
			rep.proc.logger.Error(err)

			return
		}
	}

	if err := rep.data.encoder.Encode(data); err != nil {
		if eerr := rep.data.encoder.Encode(nil); eerr != nil {
			rep.proc.logger.Error(err)
		}

		rep.proc.logger.Error(err)
	}
}

func (rep *reporter) ServeHTTP(res http.ResponseWriter, _ *http.Request) {
	res.Header().Set("Content-Type", "text/html; charset=utf-8")

	if err := rep.exportHTML(res); err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
	}
}

func (rep *reporter) exportJSON(out io.Writer) error {
	rep.mu.RLock()
	defer rep.mu.RUnlock()

	return rep.data.exportJSON(out)
}

func (rep *reporter) exportBase64(out io.Writer) error {
	outB64 := base64.NewEncoder(base64.StdEncoding, out)
	outGZ := gzip.NewWriter(outB64)

	if err := rep.exportJSON(outGZ); err != nil {
		return err
	}

	if err := outGZ.Close(); err != nil {
		return err
	}

	return outB64.Close()
}

func (rep *reporter) exportHTML(out io.Writer) error {
	file, err := rep.assets.report.Open("index.html")
	if err != nil {
		return err
	}

	html, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	html, err = rep.inject(out, html, []byte(dataTag), rep.exportBase64)
	if err != nil {
		return err
	}

	if _, err := out.Write(html); err != nil {
		return err
	}

	return nil
}

func (rep *reporter) inject(
	out io.Writer,
	html []byte,
	tag []byte,
	dataFunc func(io.Writer) error,
) ([]byte, error) {
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

type reportData struct {
	config     json.RawMessage
	param      interface{}
	buff       bytes.Buffer
	encoder    *json.Encoder
	cumulative interface{}
	metrics    map[string]metricData
}

func newReportData(config []byte) *reportData {
	data := new(reportData)

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

func (data *reportData) exportJSON(out io.Writer) error {
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

const dataTag = `<script id="data" type="application/json; charset=utf-8; gzip; base64">`
