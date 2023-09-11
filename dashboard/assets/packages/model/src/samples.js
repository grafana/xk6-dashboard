// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

const propTime = "time"

class Samples {
  constructor({ capacity = 10000, values = {}, metas = {} } = {}) {
    this.capacity = capacity
    this.values = values
    this.metas = metas
    this.length = values[propTime] ? values[propTime].length : 0
  }

  _pushOne(key, value, prop = undefined) {
    let idx = prop ? key + "." + prop : key
    if (!Object.prototype.hasOwnProperty.call(this.values, idx)) {
      this.values[idx] = Array(this.length)
      this.values[idx].meta = this.metas[key]
    } else if (this.values[idx].length < this.length) {
      this.values[idx][this.length - 1] = undefined
    }

    this.values[idx].push(value)

    if (this.length == this.capacity) {
      this.values[idx].shift()
    }
  }

  push(data) {
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(this.metas, key)) {
        this.metas[key] = {}
      }

      if (key == propTime) {
        this._pushOne(key, Math.floor(data[key].value / 1000))
        continue
      }

      for (const prop in data[key]) {
        this._pushOne(key, data[key][prop], prop)
      }
    }

    if (this.length < this.capacity) {
      this.length++
    }
  }

  annotate(metas) {
    for (const key in metas) {
      this.metas[key] = Object.assign(this.metas[key] || {}, metas[key])
      this.metas[key].name = key
    }
  }

  select(keys) {
    let data = []
    let time = this.values[propTime]

    if (!Array.isArray(time)) {
      return data
    }

    data.push(time)

    for (const key of keys) {
      const [metric] = key.split(".", 2)

      if (!Array.isArray(this.values[key])) {
        let empty = Array(time.length)
        empty.meta = this.metas[metric]
        data.push(empty)
        continue
      }

      data.push(this.values[key])
    }

    return data
  }
}

export { Samples }
