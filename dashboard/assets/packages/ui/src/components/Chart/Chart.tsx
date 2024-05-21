// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { Fragment } from "react"
import { useElementSize } from "usehooks-ts"
import "uplot/dist/uPlot.min.css"
import uPlot, { type AlignedData } from "uplot"
import UplotReact from "uplot-react"
import { Panel, SeriesPlot } from "@xk6-dashboard/view"

import { createColorScheme } from "utils"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Flex } from "components/Flex"
import { Grid } from "components/Grid"
import { Icon } from "components/Icon"
import { Paper } from "components/Paper"
import { Tooltip } from "components/Tooltip"

import { SeriesPlotWithDefinedSeries } from "./Chart.utils"
import { useOptions } from "./Chart.hooks"
import * as styles from "./Chart.css"

interface ChartProps {
  panel: Panel
  container?: boolean
}

export default function Chart({ panel, container }: ChartProps) {
  const digest = useDigest()
  const { theme } = useTheme()
  const [ref, { width }] = useElementSize()

  const plot = new SeriesPlot(digest, panel, createColorScheme(theme)) as SeriesPlotWithDefinedSeries
  const hasData = !plot.empty && plot.data[0].length > 1
  const plotData = (hasData ? plot.data : []) as AlignedData
  const options = useOptions({ plot, theme, width })

  const Wrapper = container ? Fragment : Paper

  function onCreate(chart: uPlot) {
    const color = theme == "dark" ? "#60606080" : "#d0d0d080"
    const element = chart.root.querySelector(".u-select") as HTMLElement

    if (element) {
      element.style.background = color
    }
  }

  return (
    <Grid.Column xs={12} lg={panel.fullWidth ? 12 : 6}>
      <Wrapper>
        <div ref={ref}>
          <Flex align="center" gap={1}>
            <h3 className={styles.title}>{panel.title}</h3>
            <Tooltip title={panel.summary}>
              <Icon name="info" width="20px" height="20px" />
            </Tooltip>
          </Flex>
          <div className={styles.chartWrapper}>
            {!hasData && <p className={styles.noData}>no data</p>}
            <UplotReact options={options} data={plotData} onCreate={onCreate} />
          </div>
        </div>
      </Wrapper>
    </Grid.Column>
  )
}
