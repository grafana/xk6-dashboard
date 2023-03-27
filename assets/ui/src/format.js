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
