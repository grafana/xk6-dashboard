// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import prettyMilliseconds from 'pretty-ms'
import prettyBytes from 'pretty-bytes'
import byteSize from 'byte-size'
import { roundTo } from 'round-to'

const propTime = 'time'

class Summary {
  constructor () {
    this.values = {}
    this.time = 0
  }

  update (data) {
    let values = {}
    let time = 0

    for (const key in data) {
      if (key == propTime) {
        time = Math.floor(data[key].sample.value / 1000)

        continue
      }

      values[key] = data[key]
      values[key].format = format

      for (const prop in values[key].sample) {
        let value = values[key].sample[prop]
        if (Number.isInteger(value)) {
          continue
        }

        values[key].sample[prop] = parseFloat(value.toFixed(4))
      }
    }

    this.values = values
    this.time = time
  }
}

const customUnits = {
  simple: [
    { from: 0, to: 1e3, unit: ' ', long: '   ' },
    { from: 1e3, to: 1e6, unit: 'k', long: 'kilo' },
    { from: 1e6, to: 1e9, unit: 'M', long: 'mega' },
    { from: 1e9, to: 1e12, unit: 'G', long: 'giga' },
    { from: 1e12, to: 1e15, unit: 'T', long: 'tera' },
    { from: 1e15, to: 1e18, unit: 'P', long: 'peta' },
    { from: 1e18, to: 1e21, unit: 'E', long: 'exa' },
    { from: 1e21, to: 1e24, unit: 'Z', long: 'zetta' },
    { from: 1e24, to: 1e27, unit: 'Y', long: 'yotta' }
  ]
}

function format (prop) {
  if (this.contains == 'time') {
    return prettyMilliseconds(this.sample[prop], {
      formatSubMilliseconds: true,
      compact: true
    })
  }

  if (this.contains == 'data') {
    let str = prettyBytes(this.sample[prop])

    return prop == 'rate' ? str + '/s' : str
  }

  const { value, unit } = byteSize(this.sample[prop], {
    customUnits,
    units: 'simple'
  })

  let str = `${roundTo(parseFloat(value), 2)} ${unit}`

  return prop == 'rate' ? str + '/s' : str
}

export { Summary }
