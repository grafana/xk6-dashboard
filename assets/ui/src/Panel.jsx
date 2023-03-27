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
import './Panel.css'
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import { useParentSize } from '@cutting/use-get-parent-size';
import { Card, CardContent, Typography, useTheme } from '@mui/material'
import { format } from './format';

function Panel(props) {
  const theme = useTheme()
  const summaries = useContext(MetricsContext)

  const series = {}
  series[props.metric] = { label: "foo" }

  const model = new MetricsUplot(summaries, series)
  const ref = useRef(null);
  const { width, height } = useParentSize(ref);

  const seria = summaries.values[props.metric]

  var value = Array.isArray(seria) && seria.length != 0 ? Number(seria.slice(-1)) : 0
  value = format(props.format, value)


  let options = {
    width: width,
    height: 32,
    title: value,
    series: model.series,
    axes: [{ show: false }, { show: false }],
    legend: { show: false },
    cursor: { show: false },
  }

  const color = props.failure ? theme.palette.error.main : theme.palette.primary.main

  options.series[1].points = { show: false }
  options.series[1].stroke = color
  options.series[1].fill = color + "40"

  return (
    <Card className="summary-panel" sx={{ color: color }}>
      <CardContent>
        <Typography sx={{ fontSize: "0.8rem" }} color="text.secondary" gutterBottom align='center'>{props.title}</Typography>
        <div ref={ref}>
          <UplotReact options={options} data={model.data} />
        </div>
      </CardContent>
    </Card>
  )
}

export { Panel }
