// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { useRef, useState, useLayoutEffect } from 'preact/hooks'
import { MetricsUplot } from './metrics-uplot'
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import './Chart.css'

const sync = uPlot.sync("chart");

function Chart(props) {
  const model = new MetricsUplot(props.metrics, props.series)
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
    series: model.series,
  }

  if (props.axes) {
    options.axes = props.axes
  }

  return (
    <div ref={ref} className="chart">
      <UplotReact options={options} data={model.data} />
    </div>
  )
}

export { Chart }
