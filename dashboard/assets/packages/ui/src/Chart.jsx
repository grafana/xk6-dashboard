// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useRef, useState, useLayoutEffect } from "react"
import { Grid, useTheme } from "@mui/material"
import { PropTypes } from "prop-types"

import UplotReact from "uplot-react"
import "uplot/dist/uPlot.min.css"
import uPlot from "uplot"
import { tooltipPlugin, format, dateFormats, SeriesPlot } from "@xk6-dashboard/view"

import "./Chart.css"

import { useDigest } from "./digest"

const sync = uPlot.sync("chart")

export default function Chart({ panel }) {
  const [width, setWidth] = useState(0)
  const ref = useRef(null)
  const digest = useDigest()
  const theme = useTheme()

  useLayoutEffect(() => {
    let updateWidth = () => setWidth(ref.current.offsetWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)

    return () => window.removeEventListener("resize", updateWidth)
  })

  const plot = new SeriesPlot(digest, panel, theme.palette.color)

  if (plot.empty) {
    return <div ref={ref} />
  }

  let options = {
    width: width,
    height: 250,
    title: panel.title,
    cursor: { sync: { key: sync.key } },
    legend: { live: false },
    series: plot.series,
    axes: [{}],
    plugins: [tooltipPlugin(theme.palette.background.paper)]
  }

  let grid = theme.palette.mode == "dark" ? "#202020" : "#f0f0f0"

  options.axes = plot.samples.units.map((unit) => {
    return {
      stroke: theme.palette.text.primary,
      grid: { stroke: grid },
      ticks: { stroke: grid },
      values: (self, ticks) => ticks.map((val) => format(unit, val)),
      size: 70,
      scale: unit
    }
  })

  delete options.axes[0].size
  options.axes[0].values = dateFormats

  if (options.axes.length > 2) {
    options.axes[2].side = 1
  }

  let select = theme.palette.mode == "dark" ? "#60606080" : "#d0d0d080"

  function onCreate(chart) {
    chart.root.querySelector(".u-select").style.background = select
  }

  return (
    <Grid ref={ref} className="chart panel" item md={12} lg={6}>
      <UplotReact options={options} data={plot.data} onCreate={onCreate} />
    </Grid>
  )
}

Chart.propTypes = {
  panel: PropTypes.any.isRequired
}
