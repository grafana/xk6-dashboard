import { Aggregate, AggregateType, Metrics, Metric } from "./Metrics.ts"

type SummaryRowInit = {
  values?: Record<AggregateType, number>
  metric?: Metric
}

export class SummaryRow {
  values: Record<AggregateType, number>
  metric?: Metric
  constructor({ values = {} as Record<AggregateType, number>, metric } = {} as SummaryRowInit) {
    this.values = values
    this.metric = metric
  }
}

const propTime = "time"

export class Summary {
  values: Record<string, SummaryRow>
  metrics: Metrics
  time: number

  constructor({ values = {} as Record<string, SummaryRow>, metrics = new Metrics(), time = 0 } = {}) {
    this.values = values
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

      const metric = this.metrics.find(key)

      const row = new SummaryRow({ metric })

      for (const prop in AggregateType) {
        const aggregate = prop as AggregateType
        if (data[key][aggregate]) {
          row.values[aggregate] = data[key][aggregate]
        }
      }

      values[key] = row
    }

    this.values = values
    this.time = time
  }

  annotate(metrics: Metrics): void {
    this.metrics = metrics
    for (const key in this.values) {
      this.values[key].metric = metrics.find(key)
    }
  }
}
