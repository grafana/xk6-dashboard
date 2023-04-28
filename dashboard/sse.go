// SPDX-FileCopyrightText: 2021 - 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"encoding/json"
	"net/http"

	"github.com/alexandrevicenzi/go-sse"
	"github.com/sirupsen/logrus"
)

type EventSource struct {
	*sse.Server
	logger  logrus.FieldLogger
	channel string
}

func NewEventSource(channel string, logger logrus.FieldLogger) *EventSource {
	esrc := &EventSource{
		channel: channel,
		logger:  logger,
		Server: sse.NewServer(&sse.Options{
			Headers: map[string]string{
				"Access-Control-Allow-Origin": "*",
			},
			RetryInterval:   0,
			ChannelNameFunc: func(r *http.Request) string { return channel },
			Logger:          nil,
		}),
	}

	return esrc
}

func (esrc *EventSource) SendEvent(name string, data interface{}) {
	if !esrc.HasChannel(esrc.channel) {
		return
	}

	buff, err := json.Marshal(data)
	if err != nil {
		esrc.logger.Error(err)

		return
	}

	esrc.SendMessage(esrc.channel, sse.NewMessage("", string(buff), name))
}
