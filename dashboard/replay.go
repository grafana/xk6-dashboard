// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"compress/gzip"
	"encoding/json"
	"io"
	"io/fs"
	"strings"

	"github.com/pkg/browser"
	"github.com/sirupsen/logrus"
	"github.com/spf13/afero"
	"go.k6.io/k6/lib/fsext"
)

type replayer struct {
	*eventSource

	reader io.ReadCloser

	logger logrus.FieldLogger

	options *options

	config json.RawMessage

	briefFS fs.FS
	uiFS    fs.FS
	osFS    fsext.Fs
}

func replay(
	input string,
	opts *options,
	uiConfig json.RawMessage,
	uiFS fs.FS,
	briefFS fs.FS,
	osFS fsext.Fs,
	logger logrus.FieldLogger,
) error {
	rep := &replayer{
		options:     opts,
		uiFS:        uiFS,
		briefFS:     briefFS,
		osFS:        osFS,
		logger:      logger,
		config:      uiConfig,
		eventSource: new(eventSource),
	}

	var inputFile afero.File
	var err error

	if inputFile, err = osFS.Open(input); err != nil {
		return err
	}

	rep.reader = inputFile

	if strings.HasSuffix(input, gzSuffix) {
		if rep.reader, err = gzip.NewReader(inputFile); err != nil {
			return err
		}

		defer closer(rep.reader, logger)
	}

	defer closer(inputFile, logger)

	return rep.run()
}

func (rep *replayer) run() error {
	brf := newBriefer(rep.briefFS, rep.config, rep.options.Report, rep.osFS, rep.logger)

	rep.addEventListener(brf)

	if rep.options.Port >= 0 {
		server := newWebServer(rep.uiFS, brf, rep.logger)

		rep.addEventListener(server)

		addr, err := server.listenAndServe(rep.options.addr())
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

	rep.fireEvent(configEvent, rep.config)

	decoder := json.NewDecoder(rep.reader)

	for decoder.More() {
		var input replayerEnvelope

		if err := decoder.Decode(&input); err != nil {
			return err
		}

		if input.Name == configEvent {
			continue
		}

		rep.fireEvent(input.Name, input.Data)
	}

	return nil
}

type replayerEnvelope struct {
	Name string                 `json:"event"`
	Data map[string]interface{} `json:"data"`
}
