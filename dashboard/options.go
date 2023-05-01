// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"errors"
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

type options struct {
	Port   int
	Host   string
	Period time.Duration
}

func getopts(query string) (opts *options, err error) { // nolint:nonamedreturns
	opts = &options{
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

	decoder.IgnoreUnknownKeys(true)

	decoder.RegisterConverter(time.Second, func(s string) reflect.Value {
		v, err := time.ParseDuration(s)
		if err != nil {
			return reflect.ValueOf(err)
		}

		return reflect.ValueOf(v)
	})

	defer func() {
		if r := recover(); r != nil {
			err = errInvalidDuration
		}
	}()

	if e := decoder.Decode(opts, value); e != nil {
		err = e
	}

	return opts, err
}

func (opts *options) addr() string {
	return net.JoinHostPort(opts.Host, strconv.Itoa(opts.Port))
}

func (opts *options) url() string {
	host := opts.Host
	if host == "" {
		host = "127.0.0.1"
	}

	return "http://" + net.JoinHostPort(host, strconv.Itoa(opts.Port))
}

var errInvalidDuration = errors.New("invalid duration")
