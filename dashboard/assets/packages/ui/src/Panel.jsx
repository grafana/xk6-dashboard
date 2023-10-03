// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { PropTypes } from "prop-types"

import { PanelKind } from "@xk6-dashboard/view"

import Chart from "./Chart"
import Stat from "./Stat"
import Summary from "./Summary"

export default function Panel({ panel }) {
  if (panel.kind == PanelKind.chart) {
    return <Chart panel={panel} />
  }
  if (panel.kind == PanelKind.stat) {
    return <Stat panel={panel} />
  }
  if (panel.kind == PanelKind.summary) {
    return <Summary panel={panel} />
  }
}

Panel.propTypes = {
  panel: PropTypes.any.isRequired
}
