// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { Digest } from "@xk6-dashboard/model"

export default async function () {
  var blob = new Blob([Uint8Array.from(atob(document.getElementById("data").innerText), (m) => m.codePointAt(0))])
  var resp = await new Response(blob.stream().pipeThrough(new DecompressionStream("gzip")).pipeThrough(new TextDecoderStream()))

  const digest = new Digest()

  for await (let line of makeTextFileLineIterator(resp.body.getReader())) {
    if (!line || line.length == 0) continue
    let envelope = JSON.parse(line)
    digest.onEvent(envelope.event, envelope.data)
  }

  return digest
}

// based on https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read#example_2_-_handling_text_line_by_line
async function* makeTextFileLineIterator(reader) {
  let { value, done } = await reader.read()

  let re = /\r\n|\n|\r/gm
  let startIndex = 0

  while (true) {
    let result = re.exec(value)
    if (!result) {
      if (done) {
        break
      }

      let remainder = value.substr(startIndex)
      ;({ value, done } = await reader.read())
      value = remainder + (value || "")
      startIndex = re.lastIndex = 0
      continue
    }

    yield value.substring(startIndex, result.index)

    startIndex = re.lastIndex
  }
  if (startIndex < value.length) {
    yield value.substr(startIndex)
  }
}
