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

type eventEmitter struct {
	*sse.Server
	logger  logrus.FieldLogger
	channel string
}

var _ eventListener = (*eventEmitter)(nil)

func newEventEmitter(channel string, logger logrus.FieldLogger) *eventEmitter {
	emitter := &eventEmitter{
		channel: channel,
		logger:  logger,
		Server:  sse.New(),
	}

	emitter.CreateStream(channel)

	return emitter
}

func (emitter *eventEmitter) onStart() error {
	return nil
}

func (emitter *eventEmitter) onStop() error {
	return nil
}

func (emitter *eventEmitter) onEvent(name string, data interface{}) {
	buff, err := json.Marshal(data)
	if err != nil {
		emitter.logger.Error(err)

		return
	}

	ok := emitter.TryPublish(emitter.channel, &sse.Event{Event: []byte(name), Data: buff}) // nolint:exhaustruct
	if !ok {
		emitter.logger.Warn("Event dropped")
	}
}

func (emitter *eventEmitter) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	values := req.URL.Query()

	values.Add("stream", emitter.channel)
	req.URL.RawQuery = values.Encode()

	res.Header().Set("Access-Control-Allow-Origin", "*")

	emitter.Server.ServeHTTP(res, req)
}
