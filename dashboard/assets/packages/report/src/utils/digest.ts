// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { Digest, DashboardEvent } from "@xk6-dashboard/model"

export default async function () {
  const dataElement = document.getElementById("data")!
  const codePointAt = (m: string) => m.codePointAt(0)!

  const digest = new Digest()
  const blob = new Blob([Uint8Array.from(atob(dataElement.innerText), codePointAt)])
  const resp = await new Response(
    blob.stream().pipeThrough(new DecompressionStream("gzip")).pipeThrough(new TextDecoderStream())
  )

  if (!resp.body) {
    return digest
  }

  for await (const line of makeTextFileLineIterator(resp.body.getReader())) {
    if (!line || line.length == 0) continue
    const envelope = JSON.parse(line)
    digest.onEvent({ type: envelope.event, data: envelope.data } as DashboardEvent)
  }

  return digest
}

// based on https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read#example_2_-_handling_text_line_by_line
async function* makeTextFileLineIterator(reader: ReadableStreamDefaultReader) {
  let { value, done } = await reader.read()

  const re = /\r\n|\n|\r/gm
  let startIndex = 0

  while (true) {
    const result = re.exec(value)
    if (!result) {
      if (done) {
        break
      }

      const remainder = value.substr(startIndex)
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
