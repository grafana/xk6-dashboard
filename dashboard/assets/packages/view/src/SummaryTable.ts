// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Digest, SummaryView, SummaryRow, AggregateType, Metrics } from "@xk6-dashboard/model"
import { Panel } from "./Config.ts"

import { format } from "./format.ts"

export class SummaryTable {
  view: SummaryView
  metrics: Metrics

  constructor(panel: Panel, digest: Digest) {
    this.metrics = digest.metrics
    const queries = panel.series.map((item) => item.query)
    this.view = digest.summary.select(queries)
  }

  get empty() {
    return this.view.empty
  }

  get cols() {
    return this.view.aggregates.length
  }

  get header(): Array<string> {
    return new Array<string>("metric", ...this.view.aggregates.map((a) => a as string))
  }

  get body(): Array<Array<string>> {
    const rows = new Array<Array<string>>()

    for (let i = 0; i < this.view.length; i++) {
      const row = new Array<string>()

      row.push(this.view[i].name)
      row.push(...this.view.aggregates.map((a) => this.format(this.view[i], a)))

      rows.push(row)
    }

    return rows
  }

  format(row: SummaryRow, aggregate: AggregateType): string {
    const unit = this.metrics.unit(row.metric?.name ?? "", aggregate)
    return format(unit, row.values[aggregate], true)
  }
}
