// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { propTime } from './metrics'

const palette = [
  '#7b65fa',
  '#65d1fa',
  '#af8b47',
  '#fa7765',
  '#4792af',
  '#af5347',
  '#4f5aaf',
  '#9e65fa', //
  '#d95f02',
  '#1b9e77',
  '#7570b3',
  '#e7298a',
  '#66a61e',
  '#e6ab02',
  '#a6761d',
  '#666666'
]

class MetricsUplot {
  constructor (samples, series) {
    this.data = MetricsUplot.buildData(samples, series)
    this.series = MetricsUplot.buildSeries(this.data, series)
  }

  static buildData (samples, series) {
    const values = samples.values

    let data = []
    let time = values[propTime]

    if (!Array.isArray(time)) {
      return data
    }

    data.push(time)

    for (var key in series) {
      if (!Array.isArray(values[key])) {
        data.push(Array(time.length))
        continue
      }

      data.push(values[key])
    }

    return data
  }

  static buildSeries (data, input) {
    const series = [{}]
    const keys = Object.keys(input)

    for (var i = 0; i < keys.length; i++) {
      var pidx = i % palette.length

      series.push({
        stroke: palette[pidx],
        fill: `${palette[pidx]}20`,
        ...input[keys[i]],
        show: data.length > i && Array.isArray(data[i + 1])
      })
    }

    return series
  }
}

export { MetricsUplot }
