// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useRef, useState, useLayoutEffect } from "react"
import "uplot/dist/uPlot.min.css"
import { AlignedData, Options, Series } from "uplot"
import UplotReact from "uplot-react"
import { format, Panel, SeriesPlot } from "@xk6-dashboard/view"

import { createColorScheme } from "utils"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Grid } from "components"

import * as styles from "./Stat.css"

interface StatProps {
  panel: Panel
}

export default function Stat({ panel }: StatProps) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const digest = useDigest()
  const { theme } = useTheme()

  const query = panel.series[0].query
  const plot = new SeriesPlot(digest, panel, createColorScheme(theme))

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
    return <div ref={ref} />
  }

  const serie = digest.samples.query(query)
  let value: string | undefined

  if (serie && Array.isArray(serie.values) && serie.values.length != 0) {
    value = format(serie.unit, Number(serie.values.slice(-1)), true)
  }

  const options: Options = {
    class: styles.uplot,
    width: width,
    height: 32,
    title: value,
    series: plot.series as Series[],
    axes: [{ show: false }, { show: false }],
    legend: { show: false },
    cursor: { show: false }
  }

  return (
    <Grid.Column className={styles.container} xs={6} sm={4} md={2}>
      <p className={styles.title}>{panel.title}</p>
      <div ref={ref}>
        <UplotReact options={options} data={plot.data as AlignedData} />
      </div>
    </Grid.Column>
  )
}
