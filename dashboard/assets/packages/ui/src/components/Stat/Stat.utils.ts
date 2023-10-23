// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { type Options, type Series } from "uplot"
import { Digest } from "@xk6-dashboard/model"
import { format, Panel, SeriesPlot } from "@xk6-dashboard/view"

import * as styles from "./Stat.css"

const CHART_HEIGHT = 32

interface CreateOptionsProps {
  digest: Digest
  panel: Panel
  plot: SeriesPlot
  width: number
}

export const createOptions = ({ digest, panel, plot, width }: CreateOptionsProps): Options => {
  const query = panel.series[0].query
  const serie = digest.samples.query(query)
  let title: string | undefined

  if (serie && Array.isArray(serie.values) && serie.values.length !== 0) {
    title = format(serie.unit, Number(serie.values.slice(-1)), true)
  }

  const options: Options = {
    class: styles.uplot,
    width: width,
    height: CHART_HEIGHT,
    title: title,
    series: plot.series as Series[],
    axes: [{ show: false }, { show: false }],
    legend: { show: false },
    cursor: { show: false }
  }

  return options
}
