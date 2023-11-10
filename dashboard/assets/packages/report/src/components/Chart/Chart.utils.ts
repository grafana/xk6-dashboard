// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import uPlot, { type Axis, type Options, type Series } from "uplot"
import { type UnitType } from "@xk6-dashboard/model"
import { format, tooltipPlugin, type SeriesPlot } from "@xk6-dashboard/view"

import { common, grey } from "theme/colors.css"

import * as styles from "./Chart.css"

const AXIS_SIDE = 1
const AXIS_SIZE = 70

const sync = uPlot.sync("chart")

const dateFormats = [
  [3600 * 24 * 365, "0", null, null, null, null, null, null, 1],
  [3600 * 24 * 28, "0", null, null, null, null, null, null, 1],
  [3600 * 24, "{HH}:{mm}:{ss}", null, null, null, null, null, null, 1],
  [3600, "{HH}:{mm}:{ss}", null, null, null, null, null, null, 1],
  [60, "{HH}:{mm}:{ss}", null, null, null, null, null, null, 1],
  [1, "{HH}:{mm}:{ss}", null, null, null, null, null, null, 1],
  [1e-3, "{HH}:{mm}:{ss}", null, null, null, null, null, null, 1]
]

const getAxisValues = (unit: UnitType, index: number) => {
  if (index === 0) {
    return dateFormats
  }

  return (_: uPlot, ticks: number[]) => ticks.map((val) => format(unit, val))
}

const createAxis = (length: number) => {
  return (unit: UnitType, index: number) => {
    const axis: Axis = {
      stroke: common.black,
      grid: { stroke: grey[100] },
      ticks: { stroke: grey[100] },
      values: getAxisValues(unit, index),
      scale: unit,
      space: unit === "timestamp" ? 60 : 40
    }

    if (index === 2 && length > 2) {
      axis.side = AXIS_SIDE
    }

    if (index !== 0) {
      axis.size = AXIS_SIZE
    }

    return axis
  }
}

interface CreateOptionsProps {
  plot: SeriesPlot
  width: number
}

export const createOptions = ({ plot, width }: CreateOptionsProps): Options => {
  const units = plot.samples.units
  const axes = units.map(createAxis(units.length))

  return {
    class: styles.uplot,
    width: width,
    height: 250,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    series: plot.series as Series[],
    axes: axes,
    plugins: [tooltipPlugin(common.white)]
  }
}
