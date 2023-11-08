// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"
import { Panel as PanelClass, PanelKind } from "@xk6-dashboard/view"

import Chart from "components/Chart"
import Summary from "components/Summary"

interface PanelProps {
  panel: PanelClass
  digest: Digest
}

export function Panel({ panel, digest }: PanelProps) {
  if (panel.kind == PanelKind.chart) {
    return <Chart panel={panel} digest={digest} />
  }

  if (panel.kind == PanelKind.summary) {
    return <Summary panel={panel} digest={digest} />
  }
}
