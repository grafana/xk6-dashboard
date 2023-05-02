// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { Panel } from './Panel';

function VusPanel() {
  return (<Panel title="Virtual Users" metric="vus_gauge_value" format="counter" />)
}

function RequestPanel() {
  return (<Panel title="Request Rate" metric="http_reqs_counter_rate" format="rps" />)
}

function DurationPanel() {
  return (<Panel title="Request Duration" metric="http_req_duration_trend_avg" format="duration" />)
}

function IterationPanel() {
  return (<Panel title="Iterations" metric="iterations_counter_count" format="counter" />)
}

function DataSentPanel() {
  return (<Panel title="Sent Rate" metric="data_sent_counter_rate" format="bps" />)
}

function DataReceivedPanel() {
  return (<Panel title="Received Rate" metric="data_received_counter_rate" format="bps" />)
}

function FailurePanel() {
  return (<Panel title="Failure Rate" metric="http_req_failed_rate_rate" format="rps" failure />)
}

export { IterationPanel, VusPanel, RequestPanel, DurationPanel, DataReceivedPanel, DataSentPanel, FailurePanel }
