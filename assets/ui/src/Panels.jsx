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
