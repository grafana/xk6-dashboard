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
import { tooltipPlugin } from './tooltip';
import { useParentSize } from '@cutting/use-get-parent-size';
import { Card } from '@mui/material'
import {format} from './format'

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
    legend: {
      live: false,
    },
    series: model.series,
    plugins: [tooltipPlugin()],
  }

  if (props.axes) {
    options.axes = props.axes
    options.axes[0].values = dateFormats

    for(var i = 1; i < options.axes.length; i++) {
      const fmt = options.axes[i].format

      if (!fmt) {
        continue
      }

      options.axes[i].values = (self, ticks) => ticks.map(val => format(fmt, val) )
      options.axes[i].size = 70
    }
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

// prettier-ignore
const dateFormats = [
  // tick incr          default           year                             month    day                       hour     min             sec       mode
    [3600 * 24 * 365,   "{YYYY}",         null,                            null,    null,                     null,    null,           null,        1],
    [3600 * 24 * 28,    "{MMM}",          "\n{YYYY}",                      null,    null,                     null,    null,           null,        1],
    [3600 * 24,         "{MM}-{DD}",      "\n{YYYY}",                      null,    null,                     null,    null,           null,        1],
    [3600,              "{HH}",           "\n{YYYY}-{MM}-{DD}",            null,    "\n{MM}-{DD}",            null,    null,           null,        1],
    [60,                "{HH}:{mm}",      "\n{YYYY}-{MM}-{DD}",            null,    "\n{MM}-{DD}",            null,    null,           null,        1],
    [1,                 ":{ss}",          "\n{YYYY}-{MM}-{DD} {HH}:{mm}",  null,    "\n{MM}-{DD} {HH}:{mm}",  null,    "\n{HH}:{mm}",  null,        1],
    [0.001,             ":{ss}.{fff}",    "\n{YYYY}-{MM}-{DD} {HH}:{mm}",  null,    "\n{MM}-{DD} {HH}:{mm}",  null,    "\n{HH}:{mm}",  null,        1],
  ]

export { Chart }
