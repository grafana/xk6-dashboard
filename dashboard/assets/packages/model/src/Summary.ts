// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import jmesspath from "jmespath"

import { Aggregate, AggregateType, Metrics, Metric } from "./Metrics.ts"

type SummaryRowInit = {
  values: Aggregate
  metric?: Metric
  name: string
}

export class SummaryRow {
  values: Aggregate
  metric?: Metric
  name: string
  tags?: Record<string, string>
  group?: string
  constructor({ values, metric, name } = {} as SummaryRowInit) {
    this.values = values
    this.metric = metric
    this.name = name

    if (metric && metric.type) {
      Object.defineProperty(this, metric.type, { value: true, configurable: true, enumerable: true, writable: true })
    }

    let sub = ""

    const idx = name.indexOf("{")
    if (idx && idx > 0) {
      sub = name.substring(idx)
      sub = sub.substring(1, sub.length - 1)

      const cidx = sub.indexOf(":")

      const tname = sub.substring(0, cidx)
      const tvalue = sub.substring(cidx + 1)

      this.tags = { [tname]: tvalue }

      if (tname == "group") {
        this.group = tvalue.substring(2)
      }

      name = name.substring(0, idx)
    }
  }
}

const propTime = "time"

export class SummaryView extends Array<SummaryRow> {
  aggregates: Array<AggregateType>
  constructor(values: Array<SummaryRow>) {
    super()
    this.aggregates = new Array<AggregateType>()
    for (let i = 0; i < values.length; i++) {
      const row = values[i]

      super.push(row)

      if (i == 0) {
        this.aggregates = Object.keys(row.values)
          .sort()
          .map((e) => e as AggregateType)
      }
    }
  }

  [key: number]: SummaryRow

  get empty(): boolean {
    return this.length == 0
  }
}

export class Summary {
  values: Record<string, SummaryRow>
  lookup: Array<SummaryRow>
  metrics: Metrics
  time: number

  constructor({ values = {} as Record<string, SummaryRow>, metrics = new Metrics(), time = 0 } = {}) {
    this.values = values
    this.lookup = new Array<SummaryRow>()
    this.metrics = metrics
    this.time = time
  }

  onEvent(data: Record<string, Aggregate>): void {
    const values = {} as Record<string, SummaryRow>
    let time = 0

    for (const key in data) {
      if (key == propTime) {
        time = Math.floor(data[key].value / 1000)

        continue
      }

      const row = this.newSummaryRow(key, data[key])

      values[key] = row
    }

    this.values = values
    this.time = time

    const lookup = Array<SummaryRow>()

    for (const name in this.values) {
      lookup.push(this.values[name])
    }

    this.lookup = lookup
  }

  newSummaryRow(name: string, aggregate: Aggregate): SummaryRow {
    const init = {} as SummaryRowInit

    init.name = name
    init.metric = this.metrics.find(name)
    init.values = aggregate

    return new SummaryRow(init as SummaryRowInit)
  }

  annotate(metrics: Metrics): void {
    this.metrics = metrics
    for (const key in this.values) {
      this.values[key].metric = metrics.find(key)
    }
  }

  select(queries: Array<string>): SummaryView {
    const all = new Array<SummaryRow>()

    for (const query of queries) {
      const rows = this.queryAll(query)

      if (rows.length > 0) {
        all.push(...rows)
      }
    }

    return new SummaryView(all)
  }

  queryAll(expr: string): Array<SummaryRow> {
    const res = jmesspath.search(this.lookup, expr)

    if (!Array.isArray(res) || (res as Array<SummaryRow>).length == 0) {
      return new Array<SummaryRow>()
    }

    const array = res as Array<unknown>

    if (array.at(0) instanceof SummaryRow) {
      return array as Array<SummaryRow>
    }

    return new Array<SummaryRow>()
  }
}
