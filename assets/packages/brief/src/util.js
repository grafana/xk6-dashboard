// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

export function iterable (input) {
  if (input === null || input === undefined) {
    return false
  }

  return typeof input[Symbol.iterator] === 'function'
}
