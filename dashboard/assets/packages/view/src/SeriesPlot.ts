// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { Digest, SamplesView, UnitType } from "@xk6-dashboard/model"
import { Panel, Serie } from "./Config.ts"
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

  constructor(digest: Digest, panel: Panel, colors: Color[]) {
    const queries = panel.series.map((item) => item.query)
    this.samples = digest.samples.select(queries)
    if (!this.samples.empty) {
      this.series = this.buildSeries(panel.series, colors)
    }
  }

  get empty() {
    return this.samples.empty
  }

  get data() {
    const all = new Array<Array<number | undefined>>()

    for (let i = 0; i < this.samples.length; i++) {
      all.push(this.samples[i].values)
    }

    return all
  }

  buildSeries(input: Serie[], colors: Color[]) {
    if (input[0].query != "time") {
      input = [{ query: "time", legend: "time" } as Serie, ...input]
    }
    const series = []

    for (let i = 0; i < this.samples.length; i++) {
      const pidx = i % colors.length

      let legend = this.samples[i].legend as string

      if (i < input.length && input[i].legend && input[i].legend.length > 0) {
        legend = input[i].legend
      }

      series.push({
        stroke: colors[pidx].stroke,
        fill: colors[pidx].fill,
        value: formatter(this.samples[i].unit),
        points: { show: false },
        label: legend,
        scale: this.samples[i].unit
      })
    }

    return series
  }
}
