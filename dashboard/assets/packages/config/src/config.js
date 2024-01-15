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
        panel.summary =
          "The iteration rate represents the number of times a VU has executed a test script (the `default` function) over a period of time. The panel can help you ensure that your test iteration rate matches the configuration you have specified in your test script, and that the number of VUs you have allocated matches the test capacity."

        serie("iterations[?!tags && rate]")
      })
      panel("HTTP Request Rate", "stat", ({ panel, serie }) => {
        panel.summary = "The HTTP request rate represents the number of requests over a period of time."

        serie("http_reqs[?!tags && rate]")
      })
      panel("HTTP Request Duration", "stat", ({ panel, serie }) => {
        panel.summary =
          "The HTTP request duration represents the total time for a request. This is an indication of the latency experienced when making HTTP requests against the system under test."

        serie("http_req_duration[?!tags && avg]")
      })
      panel("HTTP Request Failed", "stat", ({ panel, serie }) => {
        panel.summary =
          "The rate of failed requests according to the test configuration. Failed requests can include any number of status codes depending on your test. Refer to setResponseCallback for more details."

        serie("http_req_failed[?!tags && rate ]")
      })
      panel("Received Rate", "stat", ({ panel, serie }) => {
        panel.summary = "The amount of data received over a period of time."

        serie("data_received[?!tags && rate]")
      })
      panel("Sent Rate", "stat", ({ panel, serie }) => {
        panel.summary = "The amount of data sent to the system under test.   "

        serie("data_sent[?!tags && rate]")
      })
    })

    section(({ panel }) => {
      panel("HTTP Performance overview", ({ panel, serie }) => {
        panel.summary =
          "The HTTP request rate represents the number of requests over a period of time. The HTTP request duration 95 percentile represents the total time for 95% of the requests observed. The HTTP request failed rate represents the rate of failed requests according to the test configuration. Failed requests can include any number of status codes depending on your test. Refer to setResponseCallback for more details."
        panel.fullWidth = true

        serie("http_reqs[?!tags && rate]", "Request Rate")
        serie("http_req_duration[?!tags && p95]", "Request Duration p(95)")
        serie("http_req_failed[?!tags && rate]", "Request Failed")
      })
    })

    // chart section
    section(({ panel }) => {
      panel("VUs", ({ panel, serie }) => {
        panel.summary =
          "The number of VUs and the number of requests throughout the test run. This is an indication of how the two metrics correlate, and can help you visualize if you need to increase or decrease the number of VUs for your test."

        serie("vus[?!tags && value]")
        serie("http_reqs[?!tags && rate ]")
      })
      panel("Transfer Rate", ({ panel, serie }) => {
        panel.summary = "The rate at which data is sent to and received from the system under test."

        serie("data_received[?!tags && rate]")
        serie("data_sent[?!tags && rate]")
      })
      panel("HTTP Request Duration", ({ panel, serie }) => {
        panel.summary =
          "The HTTP request duration represents the total time for a request. This is an indication of the latency experienced when making HTTP requests against the system under test."

        serie(trend("http_req_duration"))
      })
      panel("Iteration Duration", ({ panel, serie }) => {
        panel.summary = "The time to complete one full iteration of the test, including time spent in setup and teardown."

        serie(trend("iteration_duration"))
      })
    })
  })

  tab("Timings", "timings overview", ({ tab, section }) => {
    tab.summary = `This chapter provides an overview of test run HTTP timing metrics. Graphs plot the value of metrics over time.`

    section("HTTP", ({ section, panel }) => {
      section.summary = `These metrics are generated only when the test makes HTTP requests.`

      panel("Request Duration", ({ panel, serie }) => {
        panel.summary =
          "The HTTP request duration represents the total time for a request. This is an indication of the latency experienced when making HTTP requests against the system under test."

        serie(trend("http_req_duration"))
      })

      panel("Request Failed Rate", ({ panel, serie }) => {
        panel.summary =
          "The rate of failed requests according to the test configuration. Failed requests can include any number of status codes depending on your test. Refer to setResponseCallback for more details."

        serie("http_req_failed[?!tags && rate ]")
      })

      panel("Request Rate", ({ panel, serie }) => {
        panel.summary = "The HTTP request rate represents the number of requests over a period of time."

        serie("http_reqs[?!tags && rate]")
      })

      panel("Request Waiting", ({ panel, serie }) => {
        panel.summary =
          "The time between k6 sending a request and receiving the first byte of information from the remote host. Also known as 'time to first byte' or 'TTFB'."

        serie(trend("http_req_waiting"))
      })
      panel("TLS handshaking", ({ panel, serie }) => {
        panel.summary = "The time it takes to complete the TLS handshake for the requests."

        serie(trend("http_req_tls_handshaking"))
      })
      panel("Request Sending", ({ panel, serie }) => {
        panel.summary = "The time k6 spends sending data to the remote host."

        serie(trend("http_req_sending"))
      })
      panel("Request Connecting", ({ panel, serie }) => {
        panel.summary = "The time k6 spends establishing a TCP connection to the remote host."

        serie(trend("http_req_connecting"))
      })
      panel("Request Receiving", ({ panel, serie }) => {
        panel.summary = "The time k6 spends receiving data from the remote host."

        serie(trend("http_req_receiving"))
      })

      panel("Request Blocked", ({ panel, serie }) => {
        panel.summary = "The time k6 spends waiting for a free TCP connection slot before initiating a request."

        serie(trend("http_req_blocked"))
      })
    })

    section("Browser", ({ section, panel }) => {
      section.summary = `The k6 browser module emits its own metrics based on the Core Web Vitals and Other Web Vitals.`

      panel("Request Duration", ({ panel, serie }) => {
        panel.summary =
          "The HTTP request duration represents the total time for a request. This is an indication of the latency experienced when making HTTP requests against the system under test."

        serie(trend("browser_http_req_duration"))
      })

      panel("Request Failed Rate", ({ panel, serie }) => {
        panel.summary =
          "The rate of failed requests according to the test configuration. Failed requests can include any number of status codes depending on your test. Refer to setResponseCallback for more details."

        serie("browser_http_req_failed[?!tags && rate ]")
      })

      panel("Largest Contentful Paint", ({ panel, serie }) => {
        panel.summary =
          "Largest Contentful Paint (LCP) measures the time it takes for the largest content element on a page to become visible."

        serie(trend("browser_web_vital_lcp"))
      })
      panel("First Input Delay", ({ panel, serie }) => {
        panel.summary =
          "First Input Delay (FID) measures the responsiveness of a web page by quantifying the delay between a user's first interaction, such as clicking a button, and the browser's response."

        serie(trend("browser_web_vital_fid"))
      })
      panel("Cumulative Layout Shift", ({ panel, serie }) => {
        panel.summary =
          "Cumulative Layout Shift (CLS) measures visual stability on a webpage by quantifying the amount of unexpected layout shift of visible page content."

        serie(trend("browser_web_vital_cls"))
      })
      panel("Time to First Byte", ({ panel, serie }) => {
        panel.summary =
          "Time to First Byte (TTFB) measures the time between the request for a resource and when the first byte of a response begins to arrive."

        serie(trend("browser_web_vital_ttfb"))
      })
      panel("First Contentful Paint", ({ panel, serie }) => {
        panel.summary =
          "First Contentful Paint (FCP) measures the time it takes for the first content element to be painted on the screen."

        serie(trend("browser_web_vital_fcp"))
      })
      panel("Interaction to Next Paint", ({ panel, serie }) => {
        panel.summary =
          "Interaction to Next Paint (INP) measures a page's overall responsiveness to user interactions by observing the latency of all click, tap, and keyboard interactions that occur throughout the lifespan of a user's visit to a page."

        serie(trend("browser_web_vital_inp"))
      })
    })

    section("WebSocket", ({ section, panel }) => {
      section.summary = `k6 emits the following metrics when interacting with a WebSocket service through the experimental or legacy websockets API.`

      panel("Connect Duration", ({ panel, serie }) => {
        panel.summary =
          "The duration of the WebSocket connection request. This is an indication of the latency experienced when connecting to a WebSocket server."

        serie(trend("ws_connecting"))
      })
      panel("Session Duration", ({ panel, serie }) => {
        panel.summary = "The time between the start of the connection and the end of the VU execution."

        serie(trend("ws_session_duration"))
      })
      panel("Ping Duration", ({ panel, serie }) => {
        panel.summary =
          "The duration between a ping request and its pong reception. This is an indication of the latency experienced during the roundtrip of sending a ping message to a WebSocket server, and waiting for the pong response message to come back."

        serie(trend("ws_ping"))
      })

      panel("Transfer Rate", ({ panel, serie }) => {
        panel.summary = "The total number of WebSocket messages sent, and the total number of WebSocket messages received."

        serie("ws_msgs_sent[?!tags && rate]")
        serie("ws_msgs_received[?!tags && rate]")
      })

      panel("Sessions Rate", ({ panel, serie }) => {
        panel.summary = "The total number of WebSocket sessions started."

        serie("ws_sessions[?!tags && rate]")
      })
    })

    section("gRPC", ({ section, panel }) => {
      section.summary = `k6 emits the following metrics when it interacts with a service through the gRPC API.`

      panel("Request Duration", ({ panel, serie }) => {
        panel.summary =
          "The gRPC request duration represents the total time for a gRPC request. This is an indication of the latency experienced when making gRPC requests against the system under test."

        serie(trend("grpc_req_duration"))
      })

      panel("Transfer Rate", ({ panel, serie }) => {
        panel.summary =
          "The total number of messages sent to gRPC streams, and the total number of messages received from a gRPC stream."

        serie("grpc_streams_msgs_sent[?!tags && rate]")
        serie("grpc_streams_msgs_received[?!tags && rate]")
      })

      panel("Streams Rate", ({ panel, serie }) => {
        panel.summary = "The total number of gRPC streams started."

        serie("grpc_streams[?!tags && rate]")
      })
    })
  })

  tab("Summary", ({ tab, section }) => {
    tab.summary = `This chapter provides a summary of the test run metrics. The tables contains the aggregated values of the metrics for the entire test run.`

    section("", ({ panel }) => {
      panel("Trends", "summary", ({ serie }) => {
        serie("[?!tags && trend]")
      })
    })

    section("", ({ panel }) => {
      panel("Counters", "summary", ({ serie }) => {
        serie("[?!tags && counter]")
      })
      panel("Rates", "summary", ({ serie }) => {
        serie("[?!tags && rate]")
      })
      panel("Gauges", "summary", ({ serie }) => {
        serie("[?!tags && gauge]")
      })
    })
  })

  return config
}
