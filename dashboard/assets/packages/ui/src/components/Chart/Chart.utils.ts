// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import uPlot, { type Axis, type Options, type Series } from "uplot"
import { type UnitType } from "@xk6-dashboard/model"
import { dateFormats, format, tooltipPlugin, type SeriesPlot } from "@xk6-dashboard/view"

import { type Theme } from "store/theme"
import { common, grey, midnight } from "theme/colors.css"

import * as styles from "./Chart.css"

const AXIS_SIDE = 1
const AXIS_SIZE = 70
const CHART_HEIGHT = 250
const sync = uPlot.sync("chart")

const createChartTheme = (theme: Theme) => ({
  tooltip: theme === "dark" ? midnight[900] : common.white,
  grid: theme === "dark" ? midnight[700] : grey[300],
  axes: theme === "dark" ? common.white : common.black
})

const getAxisValues = (unit: UnitType, index: number) => {
  if (index === 0) {
    return dateFormats
  }

  return (_: uPlot, ticks: number[]) => ticks.map((val) => format(unit, val))
}

const createAxis = (colors: ReturnType<typeof createChartTheme>, length: number) => {
  return (unit: UnitType, index: number) => {
    const axis: Axis = {
      stroke: colors.axes,
      grid: { stroke: colors.grid, width: 1 },
      ticks: { stroke: colors.grid },
      values: getAxisValues(unit, index),
      scale: unit
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
  theme: Theme
  width: number
}

export const createOptions = ({ plot, theme, width }: CreateOptionsProps): Options => {
  const colors = createChartTheme(theme)
  const units = plot.samples.units
  const axes = units.map(createAxis(colors, units.length))

  return {
    class: styles.uplot,
    width: width,
    height: CHART_HEIGHT,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    series: plot.series as Series[],
    axes: axes,
    plugins: [tooltipPlugin(colors.tooltip)]
  }
}
