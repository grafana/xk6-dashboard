/**
 * MIT License
 *
 * Copyright (c) 2023 Iván Szkiba
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
    width: width,
    height: 250,
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
    <Card ref={ref} >
      <UplotReact options={options} data={model.data} />
    </Card>
  )
}

export { Chart }
