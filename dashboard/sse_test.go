package dashboard

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func Test_sendEvent(t *testing.T) {
	t.Parallel()

	src := newEventSource("events", logrus.StandardLogger())
	rec := httptest.NewRecorder()
	req, err := http.NewRequest(http.MethodGet, "http://127.0.0.1/events", nil)
	ctx, cancel := context.WithCancel(context.TODO())

	req = req.WithContext(ctx)

	assert.NoError(t, err)

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Connection", "keep-alive")

	started := make(chan struct{})

	go func() {
		started <- struct{}{}

		src.ServeHTTP(rec, req)
	}()

	<-started

	time.Sleep(time.Millisecond)

	assert.True(t, src.Server.HasChannel("events"))
	src.sendEvent("foo", map[string]interface{}{"answer": 42})

	time.Sleep(time.Millisecond)

	res := rec.Result() // nolint:bodyclose

	assert.Equal(t, "text/event-stream", res.Header.Get("Content-Type"))

	data, err := io.ReadAll(res.Body) // nolint:bodyclose

	assert.NoError(t, err)

	assert.Equal(t, "event: foo\ndata: {\"answer\":42}\n\n", string(data))

	cancel()
}
