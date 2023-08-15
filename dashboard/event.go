package dashboard

type eventListener interface {
	onEvent(event string, data interface{})
}

type eventSource struct {
	listeners []eventListener
}

func (src *eventSource) addEventListener(listener eventListener) {
	src.listeners = append(src.listeners, listener)
}

func (src *eventSource) fireEvent(event string, data interface{}) {
	for _, e := range src.listeners {
		e.onEvent(event, data)
	}
}
