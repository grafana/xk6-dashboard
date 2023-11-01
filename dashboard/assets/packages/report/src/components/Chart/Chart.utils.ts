import uPlot, { type Axis, type Options, type Series } from "uplot"
import { type UnitType } from "@xk6-dashboard/model"
import { dateFormats, format, tooltipPlugin, type SeriesPlot } from "@xk6-dashboard/view"

import { common, grey } from "theme/colors.css"

const AXIS_SIDE = 1
const AXIS_SIZE = 70

const sync = uPlot.sync("chart")

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
  width: number
}

export const createOptions = ({ plot, width }: CreateOptionsProps): Options => {
  const units = plot.samples.units
  const axes = units.map(createAxis(units.length))

  return {
    width: width,
    height: 250,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    series: plot.series as Series[],
    axes: axes,
    plugins: [tooltipPlugin(common.white)]
  }
}
