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
  custom?: boolean
}

export class Query {
  name: string
  aggregate?: AggregateType

  constructor(query: string) {
    const [name, aggregate] = query.split(".", 2)

    this.aggregate = aggregate as AggregateType
    this.name = name
  }
}

const propTime = "time"

export class Metrics {
  values: Record<string, Metric>
  names: Array<string>
  _aggregates: Record<MetricType, Array<AggregateType>>
  constructor({ values = {}, names = [] } = {}) {
    this.values = values
    this.names = names
    this._aggregates = {} as Record<MetricType, Array<AggregateType>>
  }

  set aggregates(value: Record<MetricType, Array<string>>) {
    for (const mname in value) {
      const mtype = mname as MetricType
      this._aggregates[mtype] = value[mtype].map((atype) => atype.replaceAll("(", "").replaceAll(")", "") as AggregateType)
    }
  }

  onEvent(data: Record<string, object>): void {
    for (const name in data) {
      this.values[name] = { ...data[name], name }
    }

    this.names = Object.keys(this.values)
    this.names.sort()
  }

  toAggregate(data: Array<Array<number>>): Record<string, Aggregate> {
    const out = {} as Record<string, Aggregate>

    for (let i = 0; i < data.length && i < this.names.length; i++) {
      const metric = this.values[this.names[i]]
      if (!metric) {
        continue
      }
      const agg = {} as Aggregate
      const names = metric.type ? this._aggregates[metric.type] : []

      for (let j = 0; j < data[i].length && j < names.length; j++) {
        agg[names[j]] = data[i][j]
      }

      out[metric.name] = agg
    }

    return out
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
