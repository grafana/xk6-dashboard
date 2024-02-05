// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { useState } from "react"
import uPlot, { type Options, type Series } from "uplot"

import { useTimeRange } from "store/timeRange"
import { createOptions, isDblClickEvent, isZoomEvent, mergeSeries, CreateOptionsProps } from "./Chart.utils"

const useSeries = (series: Series[]) => {
  const [value, setValue] = useState(series)
  const newSeries = mergeSeries(series, value)

  const onChange = (uplot: uPlot) => {
    setValue(uplot.series)
  }

  return [newSeries, onChange] as const
}

export const useOptions = ({ plot, theme, width }: CreateOptionsProps): Options => {
  const { timeRange, setTimeRange } = useTimeRange()
  const [series, setSeries] = useSeries(plot.series)
  const newPlot = { ...plot, series }
  const scales = { timestamp: { min: timeRange?.from, max: timeRange?.to } }

  const handleSelectEvent = (uplot: uPlot) => {
    if (!isZoomEvent(uplot.cursor.event)) {
      return
    }

    const minX = uplot.posToVal(uplot.select.left, "timestamp")
    const maxX = uplot.posToVal(uplot.select.left + uplot.select.width, "timestamp")
    setTimeRange({ from: minX, to: maxX })
  }

  const handleCursorEvent = (uplot: uPlot) => {
    if (isDblClickEvent(uplot.cursor.event)) {
      setTimeRange(undefined)
    }
  }

  const hooks = {
    setCursor: [handleCursorEvent],
    // setData: [(x) => console.log("setData", x)],
    // setScale: [(x) => console.log("setScale", x)],
    setSelect: [handleSelectEvent],
    setSeries: [setSeries]
    // setSize: [(x) => console.log("setSize", x)]
  }

  return createOptions({ hooks, plot: newPlot, scales, theme, width })
}
