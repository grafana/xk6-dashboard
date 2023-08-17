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
}

var _ eventListener = (*briefer)(nil)

func newBriefer(assets fs.FS, uiConfig []byte, output string, logger logrus.FieldLogger) *briefer {
	brf := &briefer{ // nolint:exhaustruct
		assets:   assets,
		uiConfig: uiConfig,
		output:   output,
		logger:   logger,
	}

	brf.encoder = json.NewEncoder(&brf.buff)

	return brf
}

func (brf *briefer) onStart() error {
	return nil
}

func (brf *briefer) onStop() error {
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

func (brf *briefer) exportJSON(out io.Writer) error {
	brf.mu.RLock()
	defer brf.mu.RUnlock()

	bin, err := json.Marshal(brf.cumulative)
	if err != nil {
		return err
	}

	if _, err := out.Write([]byte(`{"cumulative":`)); err != nil {
		return err
	}

	if _, err := out.Write(bin); err != nil {
		return err
	}

	if _, err := out.Write([]byte(`,"snapshot":[`)); err != nil {
		return err
	}

	if _, err := out.Write(brf.buff.Bytes()); err != nil {
		return err
	}

	_, err = out.Write([]byte("]}"))

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

	html, err = brf.injectConfig(out, html)
	if err != nil {
		return err
	}

	html, err = brf.injectData(out, html)
	if err != nil {
		return err
	}

	if _, err := out.Write(html); err != nil {
		return err
	}

	return nil
}

func (brf *briefer) injectFile(out io.Writer, filename string) error {
	file, err := brf.assets.Open(filename)
	if err != nil {
		return err
	}

	data, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	_, err = out.Write(data)

	return err
}

func (brf *briefer) injectConfig(out io.Writer, html []byte) ([]byte, error) {
	idx := bytes.Index(html, configTag)

	if idx < 0 {
		panic("invalid brief HTML, no config tag")
	}

	idx += len(configTag)

	if _, err := out.Write(html[:idx]); err != nil {
		return nil, err
	}

	if err := brf.injectFile(out, "boot.js"); err != nil {
		return nil, err
	}

	if _, err := out.Write(brf.uiConfig); err != nil {
		return nil, err
	}

	if err := brf.injectFile(out, "init.js"); err != nil {
		return nil, err
	}

	return html[idx:], nil
}

func (brf *briefer) injectData(out io.Writer, html []byte) ([]byte, error) {
	idx := bytes.Index(html, dataTag)

	if idx < 0 {
		panic("invalid brief HTML, no data tag")
	}

	idx += len(dataTag)

	if _, err := out.Write(html[:idx]); err != nil {
		return nil, err
	}

	if err := brf.exportBase64(out); err != nil {
		return nil, err
	}

	return html[idx:], nil
}

var (
	configTag = []byte(`<script id="init" type="module">`)
	dataTag   = []byte(`<script id="data" type="application/json; charset=utf-8; gzip; base64">`)
)
