// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { roundTo } from 'round-to'

const propTime = 'time'
const propType = 'type'

class Metrics {
  constructor ({ capacity = 10000, values = {}, progress = 0, lastEventId = 0 } = {}) {
    this.capacity = capacity
    this.values = values
    this.length = values[propTime] ? values[propTime].length : 0
    this.progress = progress
    this.lastEventId = lastEventId
  }

  pushOne (key, value) {
    if (!this.values.hasOwnProperty(key)) {
      this.values[key] = Array(this.length)
    }

    this.values[key].push(roundTo(value, 4))

    if (this.length == this.capacity) {
      this.values[key].shift()
    }
  }

  push (data) {
    for (const key in data) {
      if (key == propTime) {
        this.pushOne(key, Math.floor(data[key].sample.value / 1000))
        this.progress = data[key].sample.pct

        continue
      }

      const typeTag = data[key].hasOwnProperty(propType)
        ? `_${data[key][propType]}`
        : ''

      for (const prop in data[key].sample) {
        this.pushOne(key + typeTag + '_' + prop, data[key].sample[prop])
      }
    }

    if (this.length < this.capacity) {
      this.length++
    }
  }
}

export { Metrics, propTime }
