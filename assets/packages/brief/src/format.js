// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import numeral from 'numeral'
import prettyBytes from 'pretty-bytes'
import prettyMilliseconds from 'pretty-ms'
import uPlot from 'uplot';

function formatDuration (value, compact) {
  return prettyMilliseconds(value,{
    formatSubMilliseconds: true,
    compact: compact
  }).split(" ").slice(0,2).join(" ")
}

function formatBytes (value) {
  return prettyBytes(value)
}

const formatDate = uPlot.fmtDate("{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}")

function format (type, value, compact) {
  switch (type) {
    case 'duration':
      return formatDuration(value, compact)
    case 'bytes':
      return formatBytes(value)
    case 'bps':
      return formatBytes(value) + '/s'
    case 'counter':
      return numeral(value).format('0.[0]a')
    case 'rps':
      return numeral(value).format('0.[00]a') + '/s'
    case 'date':
      return formatDate(value)
    case 'timestamp':
      return formatDate(new Date(value * 1000))
    default:
      return isNaN(value) || value == null ? '0' : value.toFixed(2)
  }
}

export { format }
