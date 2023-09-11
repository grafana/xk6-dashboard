// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { format } from "./format";

const palette = [
  '#7b65fa',
  '#65d1fa',
  '#af8b47',
  '#fa7765',
  '#4792af',
  '#af5347',
  '#4f5aaf',
  '#9e65fa', //
  '#d95f02',
  '#1b9e77',
  '#7570b3',
  '#e7298a',
  '#66a61e',
  '#e6ab02',
  '#a6761d',
  '#666666'
]

function formatter(kind) {
  return function(self, val, seriesIdx, dataIdx) {
    return dataIdx == null ? "--" : val == null ? "" : format(kind, val);
  }
}

class MetricsUplot {
  constructor(samples, series) {
    this.data = samples.select(Object.keys(series));
    this.series = MetricsUplot.buildSeries(this.data, series);
  }

  static buildSeries(data, input) {
    const series = [{ value: formatter("timestamp") }];
    const keys = Object.keys(input);

    for (var i = 0; i < keys.length; i++) {
      var pidx = i % palette.length

      series.push({
        stroke: palette[pidx],
        fill: `${palette[pidx]}20`,
        value: formatter(input[keys[i]].format),
        ...input[keys[i]],
        show: data.length > i && Array.isArray(data[i + 1])
      })
    }

    return series
  }
}

export { MetricsUplot }
