// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react'
import { useSSE } from 'react-hooks-sse'
import { roundTo } from 'round-to'

const propTime = 'time'
const propType = 'type'

class Metrics {
  constructor ({ capacity = 10000, values = {}, progress = 0 } = {}) {
    this.capacity = capacity
    this.values = values
    this.length = values[propTime] ? values[propTime].length : 0
    this.progress = progress
  }

  _filterDuplicate (data) {
    const timeSeries = this.values[propTime]
    const timeValue = data[propTime]

    if (!timeValue || !Array.isArray(timeSeries) || timeSeries.length == 0) {
      return false
    }

    return timeSeries.slice(-1) == timeValue
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
    if (this._filterDuplicate(data)) {
      // react or sse component call twice...
      return
    }

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

  static reducer (state, action) {
    const newState = new Metrics(state)

    newState.push(action.data)

    return newState
  }
}

function useSnapshot () {
  return useSSE('snapshot', new Metrics(), {
    parser: JSON.parse,
    stateReducer: Metrics.reducer
  })
}

function useCumulative () {
  return useSSE('cumulative', new Metrics(), {
    parser: JSON.parse,
    stateReducer: Metrics.reducer
  })
}

const MetricsContext = React.createContext(new Metrics())
MetricsContext.displayName = 'Metrics'

export { MetricsContext, useSnapshot, useCumulative, propTime }
