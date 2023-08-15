// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { Metrics } from './metrics'
import { Summary } from './summary'

export default async function () {
    var text = document.getElementById("data").innerText
    var blob = new Blob([Uint8Array.from(atob(text), m => m.codePointAt(0))])
    var stream = blob.stream().pipeThrough(new DecompressionStream("gzip"))

    var data = await new Response(stream).json()

    var metrics = new Metrics()

    for (var i = 0; i < data.snapshot.length; i++) {
        metrics.push(data.snapshot[i])
    }

    var summary = new Summary()

    summary.update(data.cumulative)

    return { metrics, summary }
}
