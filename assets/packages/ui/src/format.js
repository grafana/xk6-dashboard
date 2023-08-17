// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import numeral from 'numeral'
import prettyBytes from 'pretty-bytes'
import prettyMilliseconds from 'pretty-ms'

function formatDuration (value) {
  return prettyMilliseconds(value)
}

function formatBytes (value) {
  return prettyBytes(value)
}

function format (type, value) {
  switch (type) {
    case 'duration':
      return formatDuration(value)
    case 'bytes':
      return formatBytes(value)
    case 'bps':
      return formatBytes(value) + '/s'
    case 'counter':
      return numeral(value).format('0.[0]a')
    case 'rps':
      return numeral(value).format('0.[00]a') + '/s'
    default:
      return isNaN(value) || value == null ? '0' : value.toFixed(2)
  }
}

export { format }
