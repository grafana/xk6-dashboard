//@ts-check
/**
 * @typedef {import('../config').dashboard.Config} Config
 * @typedef {import('../config').dashboard.Tab} Tab
 * @typedef {import('../config').dashboard.Panel} Panel
 * @typedef {import('../config').dashboard.Chart} Chart
 * @typedef {import('../config').dashboard.Serie} Serie
 */

/**
 * Panel configurations for overview tab.
 * @type {Panel[]}
 */
const overviewPanels = [
  {
    id: "iterations",
    title: "Iteration Rate",
    metric: "iterations_counter_rate",
    format: "rps",
  },
  {
    id: "vus",
    title: "VUs",
    metric: "vus_gauge_value",
    format: "counter",
  },
  {
    id: "http_reqs",
    title: "HTTP Request Rate",
    metric: "http_reqs_counter_rate",
    format: "rps",
  },
  {
    id: "http_req_duration",
    title: "HTTP Request Duration",
    metric: "http_req_duration_trend_avg",
    format: "duration",
  },
  {
    id: "data_received",
    title: "Received Rate",
    metric: "data_received_counter_rate",
    format: "bps",
  },
  {
    id: "data_sent",
    title: "Sent Rate",
    metric: "data_sent_counter_rate",
    format: "bps",
  },
];

/**
 * Chart configurations for overview tab.
 * @type {Chart[]}
 */
const overviewCharts = [
  {
    id: "http_reqs",
    title: "VUs",
    series: {
      vus_gauge_value: {
        label: "VUs",
        width: 2,
        scale: "n",
        format: "counter",
      },
      http_reqs_counter_rate: {
        label: "HTTP request rate",
        scale: "1/s",
        format: "rps",
      },
    },
    axes: [{}, { scale: "n" }, { scale: "1/s", side: 1, format: "rps" }],
    scales: [{}, {}, {}],
  },
  {
    id: "data",
    title: "Transfer Rate",
    series: {
      data_sent_counter_rate: {
        label: "data sent",
        rate: true,
        scale: "sent",
        format: "bps",
      },
      data_received_counter_rate: {
        label: "data received",
        rate: true,
        width: 2,
        scale: "received",
        format: "bps",
      },
    },
    axes: [
      {},
      { scale: "sent", format: "bps" },
      { scale: "received", side: 1, format: "bps" },
    ],
  },
  {
    id: "http_req_duration",
    title: "HTTP Request Duration",
    series: {
      http_req_duration_trend_avg: {
        label: "avg",
        width: 2,
        format: "duration",
      },
      "http_req_duration_trend_p(90)": { label: "p(90)", format: "duration" },
      "http_req_duration_trend_p(95)": { label: "p(95)", format: "duration" },
    },
    axes: [{}, { format: "duration" }, { side: 1, format: "duration" }],
  },
  {
    id: "iteration_duration",
    title: "Iteration Duration",
    series: {
      iteration_duration_trend_avg: {
        label: "avg",
        width: 2,
        format: "duration",
      },
      "iteration_duration_trend_p(90)": { label: "p(90)", format: "duration" },
      "iteration_duration_trend_p(95)": { label: "p(95)", format: "duration" },
    },
    axes: [{}, { format: "duration" }, { side: 1, format: "duration" }],
  },
];

/**
 * Create optional suffix for cumulative tabs.
 * @param {string} event event name ("snapshot" or "cumulative")
 * @returns {string} empty on snapshot event otherwise " (cum)" for cumulative tabs.
 */
function suffix(event) {
  return event == "snapshot" ? "" : " (cum)";
}

/**
 * Returns true if a given event should incluide in the report.
 * True for "snapshot" otherwise false.
 * @param {string} event event name ("snapshot" or "cumulative")
 * @returns {boolean} should event included in report
 */
function reportable(event) {
  return event == "snapshot";
}

/**
 * Generate overview tab configuration.
 * @param {string} event event name ("snapshot" or "cumulative")
 * @returns {Tab} overview tab configuration
 */
function tabOverview(event) {
  return {
    id: `overview_${event}`,
    title: `Overview${suffix(event)}`,
    event: event,
    panels: overviewPanels,
    charts: overviewCharts,
    description:
      "This section provides an overview of the most important metrics of the test run. Graphs plot the value of metrics over time.",
  };
}

/**
 * Generate timing chart configuration for a given metric.
 * @param {string} metric metric name
 * @param {string} title chart title
 * @returns {Chart} chart configuration
 */
function chartTimings(metric, title) {
  return {
    id: metric,
    title: title,
    series: {
      [`${metric}_trend_avg`]: { label: "avg", width: 2, format: "duration" },
      [`${metric}_trend_p(90)`]: { label: "p(90)", format: "duration" },
      [`${metric}_trend_p(95)`]: { label: "p(95)", format: "duration" },
    },
    axes: [{}, { format: "duration" }, { side: 1, format: "duration" }],
    height: 224,
  };
}

/**
 * Generate timing tab configuration.
 * @param {string} event event name ("snapshot" or "cumulative")
 * @returns {Tab} timing tasb configuration
 */
function tabTimings(event) {
  return {
    id: `timings_${event}`,
    title: `Timings${suffix(event)}`,
    event: event,
    charts: [
      chartTimings("http_req_duration", "HTTP Request Duration"),
      chartTimings("http_req_waiting", "HTTP Request Waiting"),
      chartTimings("http_req_tls_handshaking", "HTTP TLS handshaking"),
      chartTimings("http_req_sending", "HTTP Request Sending"),
      chartTimings("http_req_connecting", "HTTP Request Connecting"),
      chartTimings("http_req_receiving", "HTTP Request Receiving"),
    ],
    panels: [],
    report: reportable(event),
    description:
      "This section provides an overview of test run HTTP timing metrics. Graphs plot the value of metrics over time.",
  };
}

/**
 * Default dashboard configuration.
 * @type {Config}
 */
const defaultConfig = {
  title: "k6 dashboard",
  tabs: [tabOverview("snapshot"), tabTimings("snapshot")],
};

export default defaultConfig;
