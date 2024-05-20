// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import uPlot, { type Axis, type Options, type Series } from "uplot"
import { type UnitType } from "@xk6-dashboard/model"
import { format, tooltipPlugin, SeriesPlot } from "@xk6-dashboard/view"

import { mergeRightProps } from "utils"
import { type Theme } from "store/theme"
import { common, grey, midnight } from "theme/colors.css"

import * as styles from "./Chart.css"

const AXIS_SIDE = 1
const AXIS_SIZE = 70
const CHART_HEIGHT = 250
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

interface SelectedUplotOptions extends Pick<Options, "hooks" | "scales" | "width"> {
  height?: number
}

export type SeriesPlotWithDefinedSeries = Omit<SeriesPlot, "series"> & { series: Series[] }

export interface CreateOptionsProps extends SelectedUplotOptions {
  plot: SeriesPlotWithDefinedSeries
  theme: Theme
}

export const createOptions = ({ height = CHART_HEIGHT, hooks, plot, scales, theme, width }: CreateOptionsProps): Options => {
  const colors = createChartTheme(theme)
  const units = plot.samples.units
  const axes = units.map(createAxis(colors, units.length))

  return {
    class: styles.uplot,
    width,
    height,
    hooks,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    scales,
    series: plot.series as Series[],
    axes,
    plugins: [tooltipPlugin(colors.tooltip)]
  }
}

export const mergeRightShowProp = mergeRightProps(["show"])

export const mergeSeries = (plotSeries: Series[] = [], stateSeries: Series[] = []) => {
  return plotSeries.map((series, i) => mergeRightShowProp(series, stateSeries[i]))
}

export const isDblClickEvent = (e?: MouseEvent | null) => e?.type === "dblclick"
export const isZoomEvent = (e?: MouseEvent | null) => e != null && !e.ctrlKey && !e.metaKey
