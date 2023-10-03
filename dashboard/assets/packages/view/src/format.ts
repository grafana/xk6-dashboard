// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import numeral from "numeral"
import prettyBytes from "pretty-bytes"
import prettyMilliseconds from "pretty-ms"
import uPlot from "uplot"

import { UnitType } from "@xk6-dashboard/model"

// should fix, probably prettyMilliseconds is not the best solution...
function formatDuration(value: number, compact: boolean): string {
  let [main, sub] = prettyMilliseconds(value, {
    formatSubMilliseconds: true,
    compact: compact
  })
    .split(" ")
    .slice(0, 2)

  if (main.match(/[0-9]+s/) && !compact) {
    main = main.replace("s", ".")

    if (sub) {
      sub = sub.substring(0, 1)
    } else {
      sub = "0"
    }

    return main + sub + "s"
  }

  if (sub) {
    main += " " + sub
  }

  return main
}

function formatBytes(value: number): string {
  return prettyBytes(value)
}

const formatDate = uPlot.fmtDate("{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}")

export function format(type: UnitType, value: number, compact: boolean = false): string {
  switch (type) {
    case UnitType.duration:
      return formatDuration(value, compact)
    case UnitType.bytes:
      return formatBytes(value)
    case UnitType.bps:
      return formatBytes(value) + "/s"
    case UnitType.counter:
      return numeral(value).format("0.[0]a")
    case UnitType.rps:
      return numeral(value).format("0.[00]a") + "/s"
    case UnitType.timestamp:
      return formatDate(new Date(value * 1000))
    default:
      return isNaN(value) || value == null ? "0" : value.toFixed(2)
  }
}

// prettier-ignore
export const dateFormats = [
  // tick incr          default           year                             month    day                       hour     min             sec       mode
    [3600 * 24 * 365,   "{YYYY}",         null,                            null,    null,                     null,    null,           null,        1],
    [3600 * 24 * 28,    "{MMM}",          "\n{YYYY}",                      null,    null,                     null,    null,           null,        1],
    [3600 * 24,         "{MM}-{DD}",      "\n{YYYY}",                      null,    null,                     null,    null,           null,        1],
    [3600,              "{HH}",           "\n{YYYY}-{MM}-{DD}",            null,    "\n{MM}-{DD}",            null,    null,           null,        1],
    [60,                "{HH}:{mm}",      "\n{YYYY}-{MM}-{DD}",            null,    "\n{MM}-{DD}",            null,    null,           null,        1],
    [1,                 ":{ss}",          "\n{YYYY}-{MM}-{DD} {HH}:{mm}",  null,    "\n{MM}-{DD} {HH}:{mm}",  null,    "\n{HH}:{mm}",  null,        1],
    [0.001,             ":{ss}.{fff}",    "\n{YYYY}-{MM}-{DD} {HH}:{mm}",  null,    "\n{MM}-{DD} {HH}:{mm}",  null,    "\n{HH}:{mm}",  null,        1],
]
