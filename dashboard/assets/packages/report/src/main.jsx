// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from "react"
import { render } from "preact"
import digest from "./digest"

import "uplot/dist/uPlot.min.css"
import "./styles.scss"

import App from "./App.jsx"

digest().then((d) => render(<App digest={d} />, document.getElementById("root")))
