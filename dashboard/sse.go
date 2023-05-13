// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"net/http"

	"github.com/r3labs/sse/v2"
	"github.com/sirupsen/logrus"
)

type eventSource struct {
	*sse.Server
	logger  logrus.FieldLogger
	channel string
}

func newEventSource(channel string, logger logrus.FieldLogger) *eventSource {
	esrc := &eventSource{
		channel: channel,
		logger:  logger,
		Server:  sse.New(),
	}

	esrc.CreateStream(channel)

	return esrc
}

func (esrc *eventSource) sendEvent(name string, data interface{}) {
	buff, err := json.Marshal(data)
	if err != nil {
		esrc.logger.Error(err)

		return
	}

	ok := esrc.TryPublish(esrc.channel, &sse.Event{Event: []byte(name), Data: buff}) // nolint:exhaustruct
	if !ok {
		esrc.logger.Warn("Event dropped")
	}
}

func (esrc *eventSource) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	values := req.URL.Query()

	values.Add("stream", esrc.channel)
	req.URL.RawQuery = values.Encode()

	esrc.Server.ServeHTTP(res, req)
}
