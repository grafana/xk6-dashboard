// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import jmesspath from "jmespath"

import { UnitType } from "./UnitType.ts"
import { Metrics, Metric, Aggregate, AggregateType, MetricType, Query } from "./Metrics.ts"

const propTime = "time"

export type SampleVectorInit = {
  length: number
  capacity: number
  aggregate: AggregateType
  values?: number[]
  metric?: Metric
  unit?: UnitType
  tags?: Record<string, string>
  group?: string
  name: string
}

export class SampleVector {
  capacity: number
  aggregate: AggregateType
  metric?: Metric
  unit: UnitType
  empty: boolean
  name: string
  tags?: Record<string, string>
  group?: string
  values: Array<number | undefined>
  constructor(
    {
      length = 0,
      capacity = 10000,
      values = new Array<number>(),
      aggregate = AggregateType.value,
      metric = undefined,
      unit = UnitType.unknown,
      name = "",
      tags = {},
      group = undefined
    } = {} as SampleVectorInit
  ) {
    this.values = length == 0 ? values : new Array<number | undefined>(length)
    this.capacity = capacity
    this.aggregate = aggregate
    this.metric = metric
    this.unit = unit
    this.empty = this.values.length == 0
    this.name = name
    this.tags = tags
    this.group = group

    Object.defineProperty(this, aggregate as string, { value: true, configurable: true, enumerable: true, writable: true })
  }

  hasTags(): boolean {
    return this.tags != undefined && Object.keys(this.tags).length != 0
  }

  formatTags(): string {
    if (!this.hasTags()) {
      return ""
    }

    let buff = "{"

    // currently only one tag supported by the go module, so this is one step iteration
    for (const name in this.tags) {
      buff += `${name}:${this.tags[name]}`
    }

    buff += "}"

    return buff
  }

  get legend(): string {
    let value = this.aggregate as string

    if (this.metric && this.metric.type != MetricType.trend) {
      if (this.name.length != 0) {
        value = this.name + this.formatTags()
      }
    }

    return value
  }

  grow(length: number): void {
    this.values[length - 1] = undefined
  }

  push(...items: number[]): number {
    let shifted = false

    items.forEach((item) => {
      this.values.push(item)
      this.empty = false
      if (this.values.length == this.capacity) {
        this.values.shift()
        shifted = true
      }
    })

    if (shifted) {
      this.empty = true
      for (let i = 0; i < this.values.length; i++) {
        if (this.values[i] != undefined) {
          this.empty = false

          break
        }
      }
    }

    return this.values.length
  }
}

export class SamplesView extends Array<SampleVector> {
  constructor(time?: SampleVector) {
    super()
    if (time) {
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
  vectors: Record<string, SampleVector>
  lookup: Record<string, Array<SampleVector>>
  constructor({ capacity = 10000, metrics = new Metrics() } = {}) {
    this.capacity = capacity
    this.metrics = metrics
    this.lookup = {}
    this.vectors = {}

    // should delete
    this.values = {}
  }

  get length(): number {
    return this.values[propTime] ? this.values[propTime].values.length : 0
  }

  _push(name: string, value: number, aggregate: AggregateType | undefined = undefined): void {
    const key = aggregate ? name + "." + aggregate : name
    let vect = this.vectors[key]

    if (!vect) {
      vect = this.newSampleVector(name, aggregate)
      this.vectors[key] = vect
      this.values[key] = vect

      let array = this.lookup[vect.name]

      if (!array) {
        array = new Array<SampleVector>()
        this.lookup[vect.name] = array
      }

      array.push(vect)
    } else if (vect.values.length < this.length) {
      vect.grow(this.length)
    }

    vect.push(value)
  }

  newSampleVector(name: string, aggregate: AggregateType | undefined = undefined): SampleVector {
    const init = {
      length: this.length,
      capacity: this.capacity,
      aggregate: aggregate as AggregateType
    } as SampleVectorInit

    let sub = ""

    const idx = name.indexOf("{")
    if (idx && idx > 0) {
      sub = name.substring(idx)
      sub = sub.substring(1, sub.length - 1)

      const cidx = sub.indexOf(":")

      const tname = sub.substring(0, cidx)
      const tvalue = sub.substring(cidx + 1)

      init.tags = { [tname]: tvalue }

      if (tname == "group") {
        init.group = tvalue.substring(2)
      }

      name = name.substring(0, idx)
    }

    init.name = name
    init.metric = this.metrics.find(name)
    init.unit = this.metrics.unit(name, aggregate)

    return new SampleVector(init as SampleVectorInit)
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

      const q = new Query(key)
      this.values[key].unit = metrics.unit(q.name, q.aggregate)
    }
  }

  select(queries: Array<string>): SamplesView {
    const data = new SamplesView(this.values[propTime])

    if (data.length == 0) {
      return data
    }

    for (const query of queries) {
      const vectors = this.queryAll(query)

      if (vectors.length > 0) {
        data.push(...vectors)
      }
    }

    return data
  }

  query(expr: string): SampleVector | undefined {
    const res = jmesspath.search(this.lookup, expr)

    if (Array.isArray(res)) {
      const array = res as Array<unknown>
      const first = array.at(0)

      return first instanceof SampleVector ? (first as SampleVector) : undefined
    }

    return res instanceof SampleVector ? (res as SampleVector) : undefined
  }

  queryAll(expr: string): Array<SampleVector> {
    const res = jmesspath.search(this.lookup, expr)

    if (!Array.isArray(res) || (res as Array<SampleVector>).length == 0) {
      return new Array<SampleVector>()
    }

    const array = res as Array<unknown>

    if (array.at(0) instanceof SampleVector) {
      return array as Array<SampleVector>
    }

    return new Array<SampleVector>()
  }
}
