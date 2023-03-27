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

import { Chart } from './Chart';

function LoadChart() {
  return (<Chart
    title="Generated Load"
    series={
      {
        vus_gauge_value: { label: "user count", width: 2, scale: "n" },
        http_reqs_counter_rate: { label: "request rate", scale: "1/s" },
      }
    }
    axes={[{}, { scale: "n" }, { scale: "1/s", side: 1 }]}
    scales={[{}, {}, {}]}
  />
  )
}

function DurationChart() {
  return (<Chart
    title="Request Duration (ms)"
    series={
      {
        http_req_duration_trend_avg: { label: "avg", width: 2 },
        "http_req_duration_trend_p(95)": { label: "p(95)" },
        "http_req_duration_trend_p(90)": { label: "p(90)" },
      }
    }
    axes={[{}, {}, { side: 1 }]}
  />)
}

function IterationChart() {
  return (<Chart
    title="Iteration Duration (ms)"
    series={
      {
        iteration_duration_trend_avg: { label: "avg", width: 2, },
        "iteration_duration_trend_p(95)": { label: "p(95)", },
        "iteration_duration_trend_p(90)": { label: "p(90)", },
      }
    }
    axes={[{}, {}, { side: 1 }]}
  />)
}

function TransferChart() {
  return (<Chart
    title="Transfer Rate (byte/sec)"
    series={
      {
        data_sent_counter_rate: { label: "data sent", rate: true, scale: "sent" },
        data_received_counter_rate: { label: "data received", rate: true, with: 2, scale: "received" },
      }
    }
    axes={[{}, { scale: "sent" }, { scale: "received", side: 1 }]}
  />
  )
}
export { LoadChart, IterationChart, TransferChart, DurationChart }
