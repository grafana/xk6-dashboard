// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

package dashboard

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func Test_sendEvent(t *testing.T) {
	t.Parallel()

	src := newEventEmitter("events", logrus.StandardLogger())
	rec := httptest.NewRecorder()
	req, err := http.NewRequest(http.MethodGet, "http://127.0.0.1/events", nil)
	ctx, cancel := context.WithCancel(context.TODO())

	req = req.WithContext(ctx)

	assert.NoError(t, err)

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Connection", "keep-alive")

	src.onEvent("foo", map[string]interface{}{"answer": 42})

	done := make(chan struct{})

	go func() {
		src.ServeHTTP(rec, req)
		done <- struct{}{}
	}()

	cancel()

	<-done

	res := rec.Result() //nolint:bodyclose

	assert.Equal(t, "text/event-stream", res.Header.Get("Content-Type"))

	data, err := io.ReadAll(res.Body)

	assert.NoError(t, err)

	assert.Equal(t, "id: 0\ndata: {\"answer\":42}\nevent: foo\n\n", string(data))

	cancel()
}

func Test_send_earlier_events(t *testing.T) {
	t.Parallel()

	src := newEventEmitter("events", logrus.StandardLogger())

	src.onEvent("foo", map[string]interface{}{"answer": 42})

	rec := httptest.NewRecorder()
	req, err := http.NewRequest(http.MethodGet, "http://127.0.0.1/events", nil)
	ctx, cancel := context.WithCancel(context.TODO())

	req = req.WithContext(ctx)

	assert.NoError(t, err)

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Connection", "keep-alive")

	done := make(chan struct{})

	go func() {
		src.ServeHTTP(rec, req)
		done <- struct{}{}
	}()

	cancel()

	<-done

	res := rec.Result() //nolint:bodyclose

	assert.Equal(t, "text/event-stream", res.Header.Get("Content-Type"))

	data, err := io.ReadAll(res.Body)

	assert.NoError(t, err)

	assert.Equal(t, "id: 0\ndata: {\"answer\":42}\nevent: foo\n\n", string(data))
}
