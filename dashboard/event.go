// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

type eventListener interface {
	onEvent(event string, data interface{})
	onStart() error
	onStop() error
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

func (src *eventSource) fireStart() error {
	for _, e := range src.listeners {
		if err := e.onStart(); err != nil {
			return err
		}
	}

	return nil
}

func (src *eventSource) fireStop() error {
	for _, e := range src.listeners {
		if err := e.onStop(); err != nil {
			return err
		}
	}

	return nil
}
