// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import { PanelKind } from "@xk6-dashboard/view"

import Chart from "./Chart"
import Summary from "./Summary"

export default function Panel({ panel, digest }) {
  if (panel.kind == PanelKind.chart) {
    return <Chart panel={panel} digest={digest} />
  }
  if (panel.kind == PanelKind.summary) {
    return <Summary panel={panel} digest={digest} />
  }
}
