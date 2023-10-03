// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Digest } from "@xk6-dashboard/model"
import { Section, Panel, PanelKind } from "./Config.ts"

export function isEmptySection(section: Section, digest: Digest): boolean {
  for (let i = 0; i < section.panels.length; i++) {
    const panel = section.panels[i]

    if (!isEmptyPanel(panel, digest)) {
      return false
    }
  }

  return true
}

function isEmptyPanel(panel: Panel, digest: Digest): boolean {
  if (panel.kind == PanelKind.summary) {
    return isEmptySummary(panel, digest)
  }

  return isEmptyPlot(panel, digest)
}

function isEmptyPlot(panel: Panel, digest: Digest): boolean {
  const plot = digest.samples.select(panel.series.map((s) => s.query))

  return plot.empty
}

function isEmptySummary(panel: Panel, digest: Digest): boolean {
  const view = digest.summary.select(panel.series.map((s) => s.query))

  return view.empty
}
