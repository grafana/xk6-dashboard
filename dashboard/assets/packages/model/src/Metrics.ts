import { UnitType } from "./UnitType.ts"

export enum AggregateType {
  value = "value",
  count = "count",
  rate = "rate",
  avg = "avg",
  min = "min",
  max = "max",
  med = "med",
  p90 = "p(90)",
  p95 = "p(95)",
  p99 = "p(99)"
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
  metric: string
  aggregate: AggregateType
  constructor(metric: string, aggregate: AggregateType) {
    this.metric = metric
    this.aggregate = aggregate
  }

  static parse(query: string): Query {
    const [metric, aggregate] = query.split(".", 2)

    return new Query(metric, aggregate as AggregateType)
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
    const q = Query.parse(query)

    return this.values[q.metric]
  }

  unit(query: string): UnitType {
    const metric = this.find(query)
    if (!metric) {
      return UnitType.unknown
    }

    const q = Query.parse(query)

    if (!q.aggregate && query != propTime) {
      return UnitType.unknown
    }

    switch (metric.type) {
      case MetricType.counter:
        switch (metric.contains) {
          case ValueType.data:
            return q.aggregate == AggregateType.count ? UnitType.bytes : UnitType.bps
          default:
            return q.aggregate == AggregateType.count ? UnitType.counter : UnitType.rps
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
