// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { useRef, useState, useLayoutEffect } from 'preact/hooks'
import { MetricsUplot } from './metrics-uplot'
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { tooltipPlugin } from './tooltip';
import './Chart.css'
import {format} from './format'

const sync = uPlot.sync("chart");

function Chart(props) {
  const model = new MetricsUplot(props.samples, props.series)
  const ref = useRef(null);

  //const { width } = useParentSize(ref);

  const [width, setWidth] = useState(0)

  useLayoutEffect(()=> {
    let updateWidth = () => setWidth(ref.current.offsetWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth);

    return () =>  window.removeEventListener("resize", updateWidth);
  })

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

  return (
    <div ref={ref} className="chart">
      <UplotReact options={options} data={model.data} />
    </div>
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
