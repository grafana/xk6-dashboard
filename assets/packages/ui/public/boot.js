const overviewPanels = [
  {
    id: 'iterations',
    title: 'Iterations',
    metric: 'iterations_counter_count',
    format: 'counter'
  },
  {
    id: 'vus',
    title: 'Virtual Users',
    metric: 'vus_gauge_value',
    format: 'counter'
  },
  {
    id: 'http_reqs',
    title: 'Request Rate',
    metric: 'http_reqs_counter_rate',
    format: 'rps'
  },
  {
    id: 'http_req_duration',
    title: 'Request Duration',
    metric: 'http_req_duration_trend_avg',
    format: 'duration'
  },
  {
    id: 'data_received',
    title: 'Received Rate',
    metric: 'data_received_counter_rate',
    format: 'bps'
  },
  {
    id: 'data_sent',
    title: 'Sent Rate',
    metric: 'data_sent_counter_rate',
    format: 'bps'
  }
]

const overviewCharts = [
  {
    id: 'http_reqs',
    title: 'Generated Load',
    series: {
      vus_gauge_value: { label: 'user count', width: 2, scale: 'n' },
      http_reqs_counter_rate: { label: 'request rate', scale: '1/s' }
    },
    axes: [{}, { scale: 'n' }, { scale: '1/s', side: 1 }],
    scales: [{}, {}, {}]
  },
  {
    id: 'data',
    title: 'Transfer Rate (byte/sec)',
    series: {
      data_sent_counter_rate: { label: 'data sent', rate: true, scale: 'sent' },
      data_received_counter_rate: {
        label: 'data received',
        rate: true,
        with: 2,
        scale: 'received'
      }
    },
    axes: [{}, { scale: 'sent' }, { scale: 'received', side: 1 }]
  },
  {
    id: 'http_req_duration',
    title: 'Request Duration (ms)',
    series: {
      http_req_duration_trend_avg: { label: 'avg', width: 2 },
      'http_req_duration_trend_p(90)': { label: 'p(90)' },
      'http_req_duration_trend_p(95)': { label: 'p(95)' }
    },
    axes: [{}, {}, { side: 1 }]
  },
  {
    id: 'iteration_duration',
    title: 'Iteration Duration (ms)',
    series: {
      iteration_duration_trend_avg: { label: 'avg', width: 2 },
      'iteration_duration_trend_p(90)': { label: 'p(90)' },
      'iteration_duration_trend_p(95)': { label: 'p(95)' }
    },
    axes: [{}, {}, { side: 1 }]
  }
]

function suffix (event) {
  return event == 'snapshot' ? '' : ' (cum)'
}

function reportable (event) {
  return event == 'snapshot'
}

function tabOverview (event) {
  return {
    id: `overview_${event}`,
    title: `Overview${suffix(event)}`,
    event: event,
    panels: overviewPanels,
    charts: overviewCharts,
    description:
      'This section provides an overview of the most important metrics of the test run. Graphs plot the value of metrics over time.'
  }
}

function chartTimings (metric, title) {
  return {
    id: metric,
    title: title,
    series: {
      [`${metric}_trend_avg`]: { label: 'avg', width: 2 },
      [`${metric}_trend_p(90)`]: { label: 'p(90)' },
      [`${metric}_trend_p(95)`]: { label: 'p(95)' }
    },
    axes: [{}, {}, { side: 1 }],
    height: 224
  }
}

function tabTimings (event) {
  return {
    id: `timings_${event}`,
    title: `Timings${suffix(event)}`,
    event: event,
    charts: [
      chartTimings('http_req_duration', 'Request Duration (ms)'),
      chartTimings('http_req_waiting', 'Request Waiting (ms)'),
      chartTimings('http_req_tls_handshaking', 'TLS handshaking (ms)'),
      chartTimings('http_req_sending', 'Request Sending (ms)'),
      chartTimings('http_req_connecting', 'Request Connecting (ms)'),
      chartTimings('http_req_receiving', 'Request Receiving (ms)')
    ],
    report: reportable(event),
    description:
      'This section provides an overview of test run HTTP timing metrics. Graphs plot the value of metrics over time.'
  }
}

const defaultConfig = {
  title: 'k6 dashboard',
  tabs: [
    tabOverview('snapshot'),
    tabOverview('cumulative'),
    tabTimings('snapshot'),
    tabTimings('cumulative'),
  ],

  tab (id) {
    let tab = null

    for (const t of this.tabs) {
      if (t.id == id) {
        tab = t

        break
      }
    }

    if (tab == null) {
      tab = { id: id }

      this.tabs.push(tab)
    }

    let lookup = (collection, id) => {
      for (const item of collection) {
        if (item.id == id) {
          return item
        }
      }

      let item = { id: id }
      collection.push(item)

      return item
    }

    tab.chart = id => lookup(tab.charts, id)
    tab.panel = id => lookup(tab.panels, id)

    return tab
  }
}

window.defaultConfig = defaultConfig
