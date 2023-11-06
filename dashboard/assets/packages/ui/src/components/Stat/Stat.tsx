// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { useElementSize } from "usehooks-ts"
import "uplot/dist/uPlot.min.css"
import { type AlignedData } from "uplot"
import UplotReact from "uplot-react"
import { Panel, SeriesPlot } from "@xk6-dashboard/view"

import { createColorScheme } from "utils"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Flex } from "components/Flex"
import { Grid } from "components/Grid"
import { Paper } from "components/Paper"

import { createOptions } from "./Stat.utils"
import * as styles from "./Stat.css"

interface StatProps {
  panel: Panel
}

export default function Stat({ panel }: StatProps) {
  const digest = useDigest()
  const { theme } = useTheme()
  const [ref, { width }] = useElementSize()

  const plot = new SeriesPlot(digest, panel, createColorScheme(theme))

  if (plot.empty) {
    return null
  }

  const options = createOptions({ digest, panel, plot, width })

  return (
    <Grid.Column xs={6} md={4} lg={2}>
      <Paper className={styles.container}>
        <Flex direction="column" justify="end" gap={0} height="100%">
          <p className={styles.title}>{panel.title}</p>
          <div ref={ref}>
            <UplotReact options={options} data={plot.data as AlignedData} />
          </div>
        </Flex>
      </Paper>
    </Grid.Column>
  )
}
