// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { useRef, useState, useLayoutEffect } from "preact/hooks"

import "uplot/dist/uPlot.min.css"
import UplotReact from "uplot-react"
import uPlot, { AlignedData, Options, Series } from "uplot"

import { Digest } from "@xk6-dashboard/model"
import { Panel, SeriesPlot, tooltipPlugin, dateFormats, format } from "@xk6-dashboard/view"

import { colors } from "utils"

import * as styles from "./Chart.css"

const sync = uPlot.sync("chart")

interface ChartProps {
  panel: Panel
  digest: Digest
}

export default function Chart({ panel, digest }: ChartProps) {
  const plot = new SeriesPlot(digest, panel, colors)
  const ref = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(0)

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

  if (plot.empty) {
    return null
  }

  const options: Options = {
    width: width,
    height: 250,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    series: plot.series as Series[],
    axes: [{}],
    plugins: [tooltipPlugin("#fafafa")]
  }

  options.axes = plot.samples.units.map((unit) => {
    return {
      stroke: "#808080",
      grid: { stroke: "#f0f0f0" },
      ticks: { stroke: "#f0f0f0" },
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

  return (
    <div ref={ref} className={styles.chart}>
      <h3 className={styles.title}>{panel.title}</h3>
      <UplotReact options={options} data={plot.data as AlignedData} />
    </div>
  )
}
