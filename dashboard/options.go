// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

package dashboard

import (
	"errors"
	"math"
	"net"
	"net/url"
	"os"
	"reflect"
	"strconv"
	"time"

	"github.com/gorilla/schema"
)

const (
	defaultHost   = ""
	defaultPort   = 5665
	defaultPeriod = time.Second * 10
	defaultOpen   = false
	defaultConfig = ".dashboard.js"
	defaultReport = ""
)

type options struct {
	Port   int
	Host   string
	Period time.Duration
	Open   bool
	Config string
	Report string
}

func getopts(query string) (opts *options, err error) { // nolint:nonamedreturns
	opts = &options{
		Port:   defaultPort,
		Host:   defaultHost,
		Period: defaultPeriod,
		Open:   defaultOpen,
		Config: defaultConfig,
		Report: defaultReport,
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

	if value.Has("open") && len(value.Get("open")) == 0 {
		opts.Open = true
	}

	return opts, err
}

func (opts *options) config() ([]byte, error) {
	if len(opts.Config) == 0 {
		return []byte{}, nil
	}

	data, err := os.ReadFile(opts.Config)
	if err != nil && os.IsNotExist(err) && opts.Config == defaultConfig {
		return []byte{}, nil
	}

	return data, err
}

func (opts *options) addr() string {
	if opts.Port < 0 {
		return ""
	}

	return net.JoinHostPort(opts.Host, strconv.Itoa(opts.Port))
}

func (opts *options) url() string {
	if opts.Port < 0 {
		return ""
	}

	host := opts.Host
	if host == "" {
		host = "127.0.0.1"
	}

	return "http://" + net.JoinHostPort(host, strconv.Itoa(opts.Port))
}

// period adjusts period, limit points per test run to 'points'.
func (opts *options) period(duration time.Duration) time.Duration {
	if duration == 0 {
		return opts.Period
	}

	optimal := float64(duration) / float64(points)

	return time.Duration(math.Ceil(optimal/float64(opts.Period))) * opts.Period
}

/*
approx. 1MB max report size, 8 hours test run with 10sec event period.
*/
const points = 2880

var errInvalidDuration = errors.New("invalid duration")
