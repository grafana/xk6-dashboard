/**
 * MIT License
 *
 * Copyright (c) 2023 Iván Szkiba
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
