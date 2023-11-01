// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import "uplot/dist/uPlot.min.css"
import UplotReact from "uplot-react"
import { AlignedData } from "uplot"

import { Digest } from "@xk6-dashboard/model"
import { Panel, SeriesPlot } from "@xk6-dashboard/view"

import { colors } from "utils"

import { createOptions } from "./Chart.utils"
import { useElementWidth } from "./Chart.hooks"
import * as styles from "./Chart.css"

interface ChartProps {
  panel: Panel
  digest: Digest
}

export default function Chart({ panel, digest }: ChartProps) {
  const plot = new SeriesPlot(digest, panel, colors)
  const [ref, width] = useElementWidth()

  if (plot.empty) {
    return null
  }

  const options = createOptions({ panel, plot, width })

  return (
    <div ref={ref} className={styles.chart}>
      <h3 className={styles.title}>{panel.title}</h3>
      <UplotReact options={options} data={plot.data as AlignedData} />
    </div>
  )
}
