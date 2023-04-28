// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

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
