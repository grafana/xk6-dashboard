// MIT License
//
// Copyright (c) 2023 Iván Szkiba
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

package internal

import (
	"net"
	"net/url"
	"reflect"
	"strconv"
	"time"

	"github.com/gorilla/schema"
)

const (
	defaultHost   = ""
	defaultPort   = 5665
	defaultPeriod = time.Second * 10
)

type Options struct {
	Port   int
	Host   string
	Period time.Duration
}

func ParseOptions(query string) (*Options, error) {
	opts := &Options{
		Port:   defaultPort,
		Host:   defaultHost,
		Period: defaultPeriod,
	}

	if query == "" {
		return opts, nil
	}

	value, err := url.ParseQuery(query)
	if err != nil {
		return nil, err
	}

	decoder := schema.NewDecoder()

	decoder.RegisterConverter(time.Second, func(s string) reflect.Value {
		v, err := time.ParseDuration(s)
		if err != nil {
			return reflect.ValueOf(err)
		}

		return reflect.ValueOf(v)
	})

	if err = decoder.Decode(opts, value); err != nil {
		return nil, err
	}

	return opts, nil
}

func (opts *Options) Addr() string {
	return net.JoinHostPort(opts.Host, strconv.Itoa(opts.Port))
}

func (opts *Options) URL() string {
	host := opts.Host
	if host == "" {
		host = "127.0.0.1"
	}

	return "http://" + net.JoinHostPort(host, strconv.Itoa(opts.Port))
}
