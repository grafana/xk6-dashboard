// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

export default (config, { tab }) => {
  config.title = "k6 dashboard"

  tab("Overview", ({ tab, section }) => {
    tab.summary = `This chapter provides an overview of the most important metrics of the test run. Graphs plot the value of metrics over time.`

    // stat section
    section(({ panel }) => {
      panel("Iteration Rate", ({ serie }) => {
        serie("iterations.rate")
      })
      panel("VUs", ({ serie }) => {
        serie("vus.value")
      })
      panel("HTTP Request Rate", ({ serie }) => {
        serie("http_reqs.rate")
      })
      panel("HTTP Request Duration", ({ serie }) => {
        serie("http_req_duration.avg")
      })
      panel("Received Rate", ({ serie }) => {
        serie("data_received.rate")
      })
      panel("Sent Rate", ({ serie }) => {
        serie("data_sent.rate")
      })
    })

    // chart section
    section(({ panel }) => {
      panel("VUs", ({ serie }) => {
        serie("vus.value", "VUs")
        serie("http_reqs.rate", "HTTP Request Rate")
      })
      panel("Transfer Rate", ({ serie }) => {
        serie("data_received.rate", "data received")
        serie("data_sent.rate", "data sent")
      })
      panel("HTTP Request Duration", "trend", ({ serie }) => {
        serie("http_req_duration")
      })
      panel("Iteration Duration", "trend", ({ serie }) => {
        serie("iteration_duration")
      })
    })
  })

  tab("Timings", "timings overview", ({ tab, section }) => {
    tab.summary = `This chapter provides an overview of test run HTTP timing metrics. Graphs plot the value of metrics over time.`

    section("HTTP", ({ section, panel }) => {
      section.summary = `These metrics are generated only when the test makes HTTP requests.`

      panel("Request Duration", "trend", ({ serie }) => {
        serie("http_req_duration")
      })
      panel("Request Waiting", "trend", ({ serie }) => {
        serie("http_req_waiting")
      })
      panel("TLS handshaking", "trend", ({ serie }) => {
        serie("http_req_tls_handshaking")
      })
      panel("Request Sending", "trend", ({ serie }) => {
        serie("http_req_sending")
      })
      panel("Request Connecting", "trend", ({ serie }) => {
        serie("http_req_connecting")
      })
      panel("Request Receiving", "trend", ({ serie }) => {
        serie("http_req_receiving")
      })
    })

    section("Browser", ({ section, panel }) => {
      section.summary = `The k6 browser module emits its own metrics based on the Core Web Vitals and Other Web Vitals.`

      panel("Request Duration", "trend", ({ serie }) => {
        serie("browser_http_req_duration")
      })
      panel("Largest Contentful Paint", "trend", ({ serie }) => {
        serie("browser_web_vital_lcp")
      })
      panel("First Input Delay", "trend", ({ serie }) => {
        serie("browser_web_vital_fid")
      })
      panel("Cumulative Layout Shift", "trend", ({ serie }) => {
        serie("browser_web_vital_cls")
      })
      panel("Time to First Byte", "trend", ({ serie }) => {
        serie("browser_web_vital_ttfb")
      })
      panel("First Contentful Paint", "trend", ({ serie }) => {
        serie("browser_web_vital_fcp")
      })
      panel("Interaction to Next Paint", "trend", ({ serie }) => {
        serie("browser_web_vital_inp")
      })
    })

    section("WebSocket", ({ section, panel }) => {
      section.summary = `k6 emits the following metrics when interacting with a WebSocket service through the experimental or legacy websockets API.`

      panel("Connect Duration", "trend", ({ serie }) => {
        serie("ws_connecting")
      })
      panel("Session Duration", "trend", ({ serie }) => {
        serie("ws_session_duration")
      })
      panel("Pong Duration", "trend", ({ serie }) => {
        serie("ws_ping")
      })
    })

    section("gRPC", { columns: 1 }, ({ section, panel }) => {
      section.summary = `k6 emits the following metrics when it interacts with a service through the gRPC API.`

      panel("Request Duration", "trend", ({ serie }) => {
        serie("grpc_req_duration")
      })
    })
  })

  return config
}
