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

import { createOptions } from "./Chart.utils"
import * as styles from "./Chart.css"

interface ChartProps {
  panel: Panel
  container?: boolean
}

export default function Chart({ panel, container }: ChartProps) {
  const digest = useDigest()
  const { theme } = useTheme()
  const [ref, { width }] = useElementSize()

  const plot = new SeriesPlot(digest, panel, createColorScheme(theme))

  if (plot.empty) {
    return null
  }

  const options = createOptions({ plot, theme, width })

  function onCreate(chart: uPlot) {
    const color = theme == "dark" ? "#60606080" : "#d0d0d080"
    const element = chart.root.querySelector(".u-select") as HTMLElement

    if (element) {
      element.style.background = color
    }
  }

  const Wrapper = container ? Fragment : Paper

  return (
    <Grid.Column xs={12} lg={6}>
      <Wrapper>
        <div ref={ref}>
          <Flex align="center" gap={1}>
            <h3 className={styles.title}>{panel.title}</h3>
            <Tooltip title={panel.summary}>
              <Icon name="info" width="20px" height="20px" />
            </Tooltip>
          </Flex>
          <UplotReact options={options} data={plot.data as AlignedData} onCreate={onCreate} />
        </div>
      </Wrapper>
    </Grid.Column>
  )
}
