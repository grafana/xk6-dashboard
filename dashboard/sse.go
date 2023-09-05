// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

	"github.com/r3labs/sse/v2"
	"github.com/sirupsen/logrus"
)

type eventEmitter struct {
	*sse.Server
	logger  logrus.FieldLogger
	channel string
	wait    sync.WaitGroup
}

var _ eventListener = (*eventEmitter)(nil)

func newEventEmitter(channel string, logger logrus.FieldLogger) *eventEmitter {
	emitter := &eventEmitter{ //nolint:exhaustruct
		channel: channel,
		logger:  logger,
		Server:  sse.New(),
	}

	emitter.Server.OnSubscribe = emitter.onSubscribe
	emitter.Server.OnUnsubscribe = emitter.onUnsubscribe

	emitter.CreateStream(channel)

	return emitter
}

func (emitter *eventEmitter) onSubscribe(_ string, _ *sse.Subscriber) {
	emitter.wait.Add(1)
}

func (emitter *eventEmitter) onUnsubscribe(_ string, _ *sse.Subscriber) {
	emitter.wait.Done()
}

func (emitter *eventEmitter) onStart() error {
	return nil
}

func (emitter *eventEmitter) onStop() error {
	emitter.wait.Wait()

	return nil
}

func (emitter *eventEmitter) onEvent(name string, data interface{}) {
	buff, err := json.Marshal(data)
	if err != nil {
		emitter.logger.Error(err)

		return
	}

	var retry []byte

	if name == stopEvent {
		retry = []byte(strconv.Itoa(maxSafeInteger))
	}

	ok := emitter.TryPublish(
		emitter.channel,
		&sse.Event{Event: []byte(name), Data: buff, Retry: retry},
	) //nolint:exhaustruct
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

const maxSafeInteger = 9007199254740991
