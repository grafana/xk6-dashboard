const overviewPanels = [
  {
    id: 'iterations',
    title: 'Iteration Rate',
    metric: 'iterations_counter_rate',
    format: 'rps'
  },
  {
    id: 'vus',
    title: 'VUs',
    metric: 'vus_gauge_value',
    format: 'counter'
  },
  {
    id: 'http_reqs',
    title: 'HTTP Request Rate',
    metric: 'http_reqs_counter_rate',
    format: 'rps'
  },
  {
    id: 'http_req_duration',
    title: 'HTTP Request Duration',
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
    title: 'VUs',
    series: {
      vus_gauge_value: { label: 'VUs', width: 2, scale: 'n', format: 'counter' },
      http_reqs_counter_rate: { label: 'HTTP request rate', scale: '1/s', format: 'rps' }
    },
    axes: [{}, { scale: 'n' }, { scale: '1/s', side: 1, format: 'rps' }],
    scales: [{}, {}, {}]
  },
  {
    id: 'data',
    title: 'Transfer Rate',
    series: {
      data_sent_counter_rate: { label: 'data sent', rate: true, scale: 'sent', format: 'bps' },
      data_received_counter_rate: {
        label: 'data received',
        rate: true,
        with: 2,
        scale: 'received',
        format: 'bps'
      }
    },
    axes: [{}, { scale: 'sent', format: 'bps' }, { scale: 'received', side: 1, format: 'bps' }]
  },
  {
    id: 'http_req_duration',
    title: 'HTTP Request Duration',
    series: {
      http_req_duration_trend_avg: { label: 'avg', width: 2, format: 'duration' },
      'http_req_duration_trend_p(90)': { label: 'p(90)', format: 'duration' },
      'http_req_duration_trend_p(95)': { label: 'p(95)', format: 'duration' }
    },
    axes: [{}, {format: 'duration'}, { side: 1, format: 'duration' }]
  },
  {
    id: 'iteration_duration',
    title: 'Iteration Duration',
    series: {
      iteration_duration_trend_avg: { label: 'avg', width: 2, format: 'duration' },
      'iteration_duration_trend_p(90)': { label: 'p(90)', format: 'duration' },
      'iteration_duration_trend_p(95)': { label: 'p(95)', format: 'duration' }
    },
    axes: [{}, {format: 'duration'}, { side: 1, format: 'duration' }]
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
      [`${metric}_trend_avg`]: { label: 'avg', width: 2, format: 'duration' },
      [`${metric}_trend_p(90)`]: { label: 'p(90)', format: 'duration' },
      [`${metric}_trend_p(95)`]: { label: 'p(95)', format: 'duration' }
    },
    axes: [{}, {format: 'duration'}, { side: 1, format: 'duration' }],
    height: 224
  }
}

function tabTimings (event) {
  return {
    id: `timings_${event}`,
    title: `Timings${suffix(event)}`,
    event: event,
    charts: [
      chartTimings('http_req_duration', 'HTTP Request Duration'),
      chartTimings('http_req_waiting', 'HTTP Request Waiting'),
      chartTimings('http_req_tls_handshaking', 'HTTP TLS handshaking'),
      chartTimings('http_req_sending', 'HTTP Request Sending'),
      chartTimings('http_req_connecting', 'HTTP Request Connecting'),
      chartTimings('http_req_receiving', 'HTTP Request Receiving')
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
    tabTimings('snapshot'),
  ],

  tabOverview,
  tabTimings,

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
