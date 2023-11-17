// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { useState } from "react"
import uPlot, { type Options, type Series } from "uplot"

import { mergeRightProps } from "utils"

import { createOptions, CreateOptionsProps } from "./Chart.utils"

const mergeRightShowProp = mergeRightProps(["show"])

const mergeSeries = (plotSeries: Series[] = [], stateSeries: Series[] = []) => {
  return plotSeries.map((series, i) => mergeRightShowProp(series, stateSeries[i]))
}

export const useOptions = ({ plot, theme, width }: CreateOptionsProps): Options => {
  const [series, setSeries] = useState<Series[]>(plot.series)
  const newPlot = { ...plot, series: mergeSeries(plot.series, series) }
  const hooks = { setSeries: [(self: uPlot) => setSeries(self.series)] }

  return createOptions({ hooks, plot: newPlot, theme, width })
}
