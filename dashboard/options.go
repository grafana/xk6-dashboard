// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

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
