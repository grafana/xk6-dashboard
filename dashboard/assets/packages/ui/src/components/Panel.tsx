// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import { PanelKind, Panel as PanelClass } from "@xk6-dashboard/view"

import Chart from "components/Chart"
import Stat from "components/Stat"
import Summary from "components/Summary"

interface PanelProps {
  container?: boolean
  panel: PanelClass
}

export default function Panel({ container, panel }: PanelProps) {
  switch (panel.kind) {
    case PanelKind.chart: {
      return <Chart panel={panel} container={container} />
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
