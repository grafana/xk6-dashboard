// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useRef, useState, useLayoutEffect } from "react"
import { Grid, Typography, useTheme } from "@mui/material"
import "uplot/dist/uPlot.min.css"
import { AlignedData, Options, Series } from "uplot"
import UplotReact from "uplot-react"
import { format, Panel, SeriesPlot } from "@xk6-dashboard/view"

import { useDigest } from "store/digest"

import "./Stat.css"

interface StatProps {
  panel: Panel
}

export default function Stat({ panel }: StatProps) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const digest = useDigest()
  const theme = useTheme()

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

  const query = panel.series[0].query

  const plot = new SeriesPlot(digest, panel, theme.palette.color)

  if (plot.empty) {
    return <div ref={ref} />
  }

  const serie = digest.samples.query(query)
  let value: string | undefined

  if (serie && Array.isArray(serie.values) && serie.values.length != 0) {
    value = format(serie.unit, Number(serie.values.slice(-1)), true)
  }

  const options: Options = {
    width: width,
    height: 32,
    title: value,
    series: plot.series as Series[],
    axes: [{ show: false }, { show: false }],
    legend: { show: false },
    cursor: { show: false }
  }

  return (
    <Grid item className="panel stat" xs={6} sm={4} md={2}>
      <Typography sx={{ fontSize: "0.8rem" }} color="text.secondary" gutterBottom align="center">
        {panel.title}
      </Typography>
      <div ref={ref}>
        <UplotReact options={options} data={plot.data as AlignedData} />
      </div>
    </Grid>
  )
}
