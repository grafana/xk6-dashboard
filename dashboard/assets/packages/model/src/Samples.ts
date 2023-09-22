// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { UnitType } from "./UnitType.ts"
import { Metrics, Metric, Aggregate, AggregateType } from "./Metrics.ts"

const propTime = "time"

export type SampleVectorInit = {
  length: number
  capacity: number
  aggregate: AggregateType
  values?: number[]
  metric?: Metric
  unit?: UnitType
}

export class SampleVector extends Array<number | undefined> {
  capacity: number
  aggregate: AggregateType
  metric?: Metric
  unit: UnitType
  empty: boolean
  constructor(
    {
      length = 0,
      capacity = 10000,
      values = new Array<number>(),
      aggregate = AggregateType.value,
      metric = undefined,
      unit = UnitType.unknown
    } = {} as SampleVectorInit
  ) {
    super(length)
    if (values.length > 0) {
      super.push(...values)
    }
    this.capacity = capacity
    this.aggregate = aggregate
    this.metric = metric
    this.unit = unit
    this.empty = values.length == 0
  }

  [key: number]: number | undefined

  grow(length: number): void {
    this[length - 1] = undefined
  }

  push(...items: number[]): number {
    let shifted = false

    items.forEach((item) => {
      super.push(item)
      this.empty = false
      if (this.length == this.capacity) {
        this.shift()
        shifted = true
      }
    })

    if (shifted) {
      this.empty = true
      for (let i = 0; i < this.length; i++) {
        if (this[i] != undefined) {
          this.empty = false

          break
        }
      }
    }

    return this.length
  }
}

export class SamplesView extends Array<SampleVector> {
  constructor(time?: SampleVector) {
    super()
    if (Array.isArray(time)) {
      super.push(time)
    }
  }

  [key: number]: SampleVector

  get empty(): boolean {
    if (this.length < 2) {
      return true
    }

    for (let i = 1; i < this.length; i++) {
      if (!this[i].empty) {
        return false
      }
    }

    return true
  }

  get units(): UnitType[] {
    const all = new Array<UnitType>()

    this.forEach((vect) => {
      if (vect.unit && !all.includes(vect.unit)) {
        all.push(vect.unit)
      }
    })

    return all
  }
}

export class Samples {
  private capacity: number
  private metrics: Metrics
  values: Record<string, SampleVector>
  constructor({ capacity = 10000, metrics = new Metrics(), values = {} as Record<string, SampleVector> } = {}) {
    this.capacity = capacity
    this.metrics = metrics
    this.values = values
  }

  get length(): number {
    return this.values[propTime] ? this.values[propTime].length : 0
  }

  _push(name: string, value: number, prop: AggregateType | undefined = undefined): void {
    const key = prop ? name + "." + prop : name
    let array = this.values[key]

    if (!array) {
      array = new SampleVector({
        length: this.length,
        capacity: this.capacity,
        metric: this.metrics.values[key],
        unit: this.metrics.unit(key),
        aggregate: prop
      } as SampleVectorInit)
      this.values[key] = array
    } else if (array.length < this.length) {
      array.grow(this.length)
    }

    array.push(value)
  }

  onEvent(data: Record<string, Aggregate>) {
    for (const name in data) {
      if (name == propTime) {
        this._push(name, Math.floor(data[name].value / 1000))
        continue
      }

      for (const prop in data[name]) {
        const aggregate = prop as AggregateType
        this._push(name, data[name][aggregate], aggregate)
      }
    }
  }

  annotate(metrics: Metrics) {
    this.metrics = metrics

    for (const key in this.values) {
      this.values[key].metric = metrics.find(key)
      this.values[key].unit = metrics.unit(key)
    }
  }

  select(queries: Array<string>): SamplesView {
    const data = new SamplesView(this.values[propTime])

    if (data.length == 0) {
      return data
    }

    for (const query of queries) {
      const [, aggregate] = query.split(".", 2)

      let array = this.values[query]

      if (!Array.isArray(array)) {
        array = new SampleVector({
          length: data[0].length,
          capacity: this.capacity,
          aggregate,
          metric: this.metrics.find(query),
          unit: this.metrics.unit(query)
        } as SampleVectorInit)
      }

      data.push(array)
    }

    return data
  }
}
