// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useRef, useState, useLayoutEffect } from "react"
import "uplot/dist/uPlot.min.css"
import uPlot, { AlignedData, Options, Series } from "uplot"
import UplotReact from "uplot-react"
import { tooltipPlugin, format, dateFormats, Panel, SeriesPlot } from "@xk6-dashboard/view"

import { colors } from "theme/colors.css"
import { createColorScheme } from "utils"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Grid } from "components"

import * as styles from "./Chart.css"

const sync = uPlot.sync("chart")

interface ChartProps {
  panel: Panel
}

export default function Chart({ panel }: ChartProps) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const digest = useDigest()
  const { theme } = useTheme()

  const tooltipColor = theme == "dark" ? colors.black : colors.white
  const gridColor = theme == "dark" ? colors.gray10 : colors.gray0
  const axesColor = theme == "dark" ? colors.white : colors.black

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)

    return () => window.removeEventListener("resize", updateWidth)
  })

  const plot = new SeriesPlot(digest, panel, createColorScheme(theme))

  if (plot.empty) {
    return <div ref={ref} />
  }

  const options: Options = {
    class: styles.uplot,
    width: width,
    height: 250,
    title: panel.title,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    series: plot.series as Series[],
    axes: [{}],
    plugins: [tooltipPlugin(tooltipColor)]
  }

  options.axes = plot.samples.units.map((unit) => {
    return {
      stroke: axesColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { stroke: gridColor },
      values: (_, ticks) => ticks.map((val) => format(unit, val)),
      size: 70,
      scale: unit
    }
  })

  delete options.axes[0].size
  options.axes[0].values = dateFormats

  if (options.axes.length > 2) {
    options.axes[2].side = 1
  }

  function onCreate(chart: uPlot) {
    const color = theme == "dark" ? "#60606080" : "#d0d0d080"
    const element = chart.root.querySelector(".u-select") as HTMLElement

    if (element) {
      element.style.background = color
    }
  }

  return (
    <Grid.Column ref={ref} xs={12} lg={6}>
      <UplotReact options={options} data={plot.data as AlignedData} onCreate={onCreate} />
    </Grid.Column>
  )
}
