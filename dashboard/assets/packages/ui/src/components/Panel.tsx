// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import { PanelKind, Panel as ViewPanel } from "@xk6-dashboard/view"

import Chart from "components/Chart"
import Stat from "components/Stat"
import Summary from "components/Summary"

interface PanelProps {
  panel: ViewPanel
}

export default function Panel({ panel }: PanelProps) {
  switch (panel.kind) {
    case PanelKind.chart: {
      return <Chart panel={panel} />
    }
    case PanelKind.stat: {
      return <Stat panel={panel} />
    }
    case PanelKind.summary: {
      return <Summary panel={panel} />
    }
    default: {
      return null
    }
  }
}
