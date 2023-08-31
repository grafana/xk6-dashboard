// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { Samples, Summary } from "@xk6-dashboard/model";

export default async function () {
  var text = document.getElementById("data").innerText;
  var blob = new Blob([Uint8Array.from(atob(text), (m) => m.codePointAt(0))]);
  var stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));

  var data = await new Response(stream).json();

  var samples = new Samples();

  for (var i = 0; i < data.snapshot.length; i++) {
    samples.push(data.snapshot[i]);
  }

  samples.annotate(data.metrics);

  var summary = new Summary();

  summary.update(data.cumulative);
  summary.annotate(data.metrics);

  return { metrics: data.metrics, samples, summary, config: data.config };
}
