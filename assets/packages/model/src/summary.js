// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import prettyMilliseconds from "pretty-ms"
import prettyBytes from "pretty-bytes"
import byteSize from "byte-size"
import { roundTo } from "round-to"

const propTime = "time"

class Summary {
  constructor() {
    this.values = {}
    this.metas = {}
    this.time = 0
  }

  update(data) {
    let values = {}
    let time = 0

    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(this.metas, key)) {
        this.metas[key] = {}
      }

      if (key == propTime) {
        time = Math.floor(data[key].value / 1000)

        continue
      }

      values[key] = data[key]

      for (const prop in values[key]) {
        let value = values[key][prop]
        if (Number.isInteger(value)) {
          continue
        }

        values[key][prop] = parseFloat(value)
      }

      values[key].meta = this.metas[key]

      values[key].format = format
    }

    this.values = values
    this.time = time
  }

  annotate(metas) {
    for (const key in metas) {
      if (!Object.prototype.hasOwnProperty.call(this.metas, key)) {
        this.metas[key] = {}
      }

      this.metas[key] = Object.assign(this.metas[key], metas[key])
      this.metas[key].name = key
    }
  }
}

const customUnits = {
  simple: [
    { from: 0, to: 1e3, unit: " ", long: "   " },
    { from: 1e3, to: 1e6, unit: "k", long: "kilo" },
    { from: 1e6, to: 1e9, unit: "M", long: "mega" },
    { from: 1e9, to: 1e12, unit: "G", long: "giga" },
    { from: 1e12, to: 1e15, unit: "T", long: "tera" },
    { from: 1e15, to: 1e18, unit: "P", long: "peta" },
    { from: 1e18, to: 1e21, unit: "E", long: "exa" },
    { from: 1e21, to: 1e24, unit: "Z", long: "zetta" },
    { from: 1e24, to: 1e27, unit: "Y", long: "yotta" }
  ]
}

function format(prop) {
  if (this.meta.contains == "time") {
    return prettyMilliseconds(this[prop], {
      formatSubMilliseconds: true,
      compact: true
    })
  }

  if (this.meta.contains == "data") {
    let str = prettyBytes(this[prop])

    return prop == "rate" ? str + "/s" : str
  }

  const { value, unit } = byteSize(this[prop], {
    customUnits,
    units: "simple"
  })

  let str = `${roundTo(parseFloat(value), 2)} ${unit}`

  return prop == "rate" ? str + "/s" : str
}

export { Summary }
