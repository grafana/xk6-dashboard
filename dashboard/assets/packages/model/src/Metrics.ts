// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { UnitType } from "./UnitType.ts"

export enum AggregateType {
  value = "value",
  count = "count",
  rate = "rate",
  avg = "avg",
  min = "min",
  max = "max",
  med = "med",
  p90 = "p90",
  p95 = "p95",
  p99 = "p99"
}

export type Aggregate = {
  [x in AggregateType]: number
}

export const enum ValueType {
  time = "time",
  data = "data",
  default = "default"
}

export const enum MetricType {
  gauge = "gauge",
  counter = "counter",
  rate = "rate",
  trend = "trend"
}

export type Metric = {
  name: string
  contains?: ValueType
  type?: MetricType
}

export class Query {
  name: string
  aggregate?: AggregateType
  tags?: Record<string, string>
  group?: string
  scenario?: string

  constructor(query: string) {
    const [name, aggregate] = query.split(".", 2)

    this.aggregate = aggregate as AggregateType
    this.name = name

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

      this.name = name.substring(0, idx)
    }
  }
}

const propTime = "time"

export class Metrics {
  values: Record<string, Metric>
  constructor({ values = {} } = {}) {
    this.values = values
  }

  onEvent(data: Record<string, object>): void {
    for (const name in data) {
      this.values[name] = { ...data[name], name }
    }
  }

  find(query: string): Metric | undefined {
    const q = new Query(query)

    return this.values[q.name]
  }

  unit(name: string, aggregate?: AggregateType): UnitType {
    const metric = this.find(name)
    if (!metric) {
      return UnitType.unknown
    }

    if (!aggregate && name != propTime) {
      return UnitType.unknown
    }

    switch (metric.type) {
      case MetricType.counter:
        switch (metric.contains) {
          case ValueType.data:
            return aggregate == AggregateType.count ? UnitType.bytes : UnitType.bps
          default:
            return aggregate == AggregateType.count ? UnitType.counter : UnitType.rps
        }

      case MetricType.rate:
        switch (metric.contains) {
          case ValueType.data:
            return UnitType.bps
          default:
            return UnitType.rps
        }

      case MetricType.gauge:
        switch (metric.contains) {
          case ValueType.time:
            return metric.name == propTime ? UnitType.timestamp : UnitType.duration
          case ValueType.data:
            return UnitType.bytes
          default:
            return UnitType.counter
        }

      case MetricType.trend:
        switch (metric.contains) {
          case ValueType.time:
            return UnitType.duration
          case ValueType.data:
            return UnitType.bps
          default:
            return UnitType.rps
        }

      default:
        return UnitType.unknown
    }
  }
}
