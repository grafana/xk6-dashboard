// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

package dashboard

import (
	"github.com/sirupsen/logrus"
	"go.k6.io/k6/cmd/state"
	"go.k6.io/k6/lib/fsext"
	"go.k6.io/k6/loader"
	"go.k6.io/k6/output"
)

type process struct {
	logger logrus.FieldLogger
	fs     fsext.Fs
	env    map[string]string
	wd     string
}

func (proc *process) fromParams(params output.Params) *process {
	proc.fs = params.FS
	proc.logger = params.Logger
	proc.env = params.Environment
	proc.wd = loader.Dir(params.ScriptPath).Path

	return proc
}

func (proc *process) fromGlobalState(gs *state.GlobalState) *process {
	proc.fs = gs.FS
	proc.logger = gs.Logger
	proc.env = gs.Env
	var err error
	proc.wd, err = gs.Getwd()
	if err != nil {
		panic(err)
	}

	return proc
}
