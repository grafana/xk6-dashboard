// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

function trend(name) {
  return `${name}[?!tags && (avg || p90 || p95 || p99)]`
}

export default (config, { tab }) => {
  config.title = "k6 dashboard"

  tab("Overview", ({ tab, section }) => {
    tab.summary = `This chapter provides an overview of the most important metrics of the test run. Graphs plot the value of metrics over time.`

    // stat section
    section(({ panel }) => {
      panel("Iteration Rate", "stat", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("iterations[?!tags && rate]")
      })
      panel("VUs", "stat", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("vus[?!tags && value]")
      })
      panel("HTTP Request Rate", "stat", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("http_reqs[?!tags && rate]")
      })
      panel("HTTP Request Duration", "stat", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("http_req_duration[?!tags && avg]")
      })
      panel("Received Rate", "stat", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("data_received[?!tags && rate]")
      })
      panel("Sent Rate", "stat", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("data_sent[?!tags && rate]")
      })
    })

    section(({ panel }) => {
      panel("HTTP Performance overview", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"
        panel.fullWidth = true

        serie("vus[?!tags && value]", "VUs")
        serie("http_reqs[?!tags && rate]", "Request Rate")
        serie("http_req_duration[?!tags && p95]", "Request Duration p(95)")
        serie("http_req_failed[?!tags && rate ]", "Request Failed")
      })
    })

    // chart section
    section(({ panel }) => {
      panel("VUs", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("vus[?!tags && value]")
        serie("http_reqs[?!tags && rate ]")
      })
      panel("Transfer Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("data_received[?!tags && rate]")
        serie("data_sent[?!tags && rate]")
      })
      panel("HTTP Request Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_duration"))
      })
      panel("Iteration Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("iteration_duration"))
      })
    })
  })

  tab("Timings", "timings overview", ({ tab, section }) => {
    tab.summary = `This chapter provides an overview of test run HTTP timing metrics. Graphs plot the value of metrics over time.`

    section("HTTP", ({ section, panel }) => {
      section.summary = `These metrics are generated only when the test makes HTTP requests.`

      panel("Request Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_duration"))
      })

      panel("Request Failed Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("http_req_failed[?!tags && rate ]")
      })

      panel("Request Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("http_reqs[?!tags && rate]")
      })

      panel("Request Waiting", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_waiting"))
      })
      panel("TLS handshaking", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_tls_handshaking"))
      })
      panel("Request Sending", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_sending"))
      })
      panel("Request Connecting", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_connecting"))
      })
      panel("Request Receiving", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_receiving"))
      })

      panel("Request Blocked", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("http_req_blocked"))
      })
    })

    section("Browser", ({ section, panel }) => {
      section.summary = `The k6 browser module emits its own metrics based on the Core Web Vitals and Other Web Vitals.`

      panel("Request Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_http_req_duration"))
      })

      panel("Request Failed Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("browser_http_req_failed[?!tags && rate ]")
      })

      panel("Largest Contentful Paint", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_web_vital_lcp"))
      })
      panel("First Input Delay", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_web_vital_fid"))
      })
      panel("Cumulative Layout Shift", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_web_vital_cls"))
      })
      panel("Time to First Byte", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_web_vital_ttfb"))
      })
      panel("First Contentful Paint", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_web_vital_fcp"))
      })
      panel("Interaction to Next Paint", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("browser_web_vital_inp"))
      })
    })

    section("WebSocket", ({ section, panel }) => {
      section.summary = `k6 emits the following metrics when interacting with a WebSocket service through the experimental or legacy websockets API.`

      panel("Connect Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("ws_connecting"))
      })
      panel("Session Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("ws_session_duration"))
      })
      panel("Ping Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("ws_ping"))
      })

      panel("Transfer Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("ws_msgs_sent[?!tags && rate]")
        serie("ws_msgs_received[?!tags && rate]")
      })

      panel("Sessions Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("ws_sessions[?!tags && rate]")
      })
    })

    section("gRPC", ({ section, panel }) => {
      section.summary = `k6 emits the following metrics when it interacts with a service through the gRPC API.`

      panel("Request Duration", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie(trend("grpc_req_duration"))
      })

      panel("Transfer Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("grpc_streams_msgs_sent[?!tags && rate]")
        serie("grpc_streams_msgs_received[?!tags && rate]")
      })

      panel("Streams Rate", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("grpc_streams[?!tags && rate]")
      })
    })
  })

  tab("Summary", ({ tab, section }) => {
    tab.summary = `This chapter provides a summary of the test run metrics. The tables contains the aggregated values of the metrics for the entire test run.`

    section("", ({ panel }) => {
      panel("Trends", "summary", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("[?!tags && trend]")
      })
    })

    section("", ({ panel }) => {
      panel("Counters", "summary", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("[?!tags && counter]")
      })
      panel("Rates", "summary", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("[?!tags && rate]")
      })
      panel("Gauges", "summary", ({ panel, serie }) => {
        panel.summary = "<placeholder panel summary>"

        serie("[?!tags && gauge]")
      })
    })
  })

  return config
}
