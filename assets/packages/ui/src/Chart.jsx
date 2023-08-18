// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React, { useContext, useRef } from 'react'
import { MetricsContext } from './metrics'
import { MetricsUplot } from './metrics-uplot'
import './Chart.css'
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { useParentSize } from '@cutting/use-get-parent-size';
import { Card } from '@mui/material'

const sync = uPlot.sync("chart");

function Chart(props) {
  const model = new MetricsUplot(useContext(MetricsContext), props.series)
  const ref = useRef(null);
  const { width } = useParentSize(ref);

  if (model.data.length < (props.series.length + 1)) {
    return (<span></span>)
  }

  let options = {
    width: props.width || width,
    height: props.height || 250,
    title: props.title,
    cursor: {
      sync: { key: sync.key },
    },
    series: model.series,
  }

  if (props.axes) {
    options.axes = props.axes
  }

  if (props.plain) {
    options.cursor.show = false

    return <UplotReact options={options} data={model.data} />
  }

  return (
    <Card ref={ref} >
      <UplotReact options={options} data={model.data} />
    </Card>
  )
}

export { Chart }
