// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { Digest, SamplesView, UnitType } from "@xk6-dashboard/model"
import { Serie } from "./Config.ts"
import { format } from "./format.ts"

function formatter(unit: UnitType) {
  return function (self: never, val: number, seriesIdx: never, dataIdx: never): string {
    return dataIdx == null ? "--" : val == null ? "" : format(unit, val)
  }
}

type Color = { stroke: string; fill: string } // temp solution

export class SeriesPlot {
  samples: SamplesView
  series?: object

  constructor(digest: Digest, series: Serie[], colors: Color[]) {
    const queries = series.map((item) => item.query)
    this.samples = digest.samples.select(queries)
    if (!this.samples.empty) {
      this.series = this.buildSeries(series, colors)
    }
  }

  get empty() {
    return this.samples.empty
  }

  buildSeries(input: Serie[], colors: Color[]) {
    if (input[0].query != "time") {
      input = [{ query: "time", legend: "time" } as Serie, ...input]
    }
    const series = []

    for (let i = 0; i < input.length; i++) {
      const pidx = i % colors.length

      series.push({
        stroke: colors[pidx].stroke,
        fill: colors[pidx].fill,
        value: formatter(this.samples[i].unit),
        points: { show: false },
        label: input[i].legend
      })
    }

    return series
  }
}
