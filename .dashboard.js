// helper for adding p(99) to existing chart
function addP99 (chart) {
  chart.series = {
    ...chart.series,
    'http_req_duration_trend_p(99)': { label: 'p(99)' }
  }
}

// define request duration panel
function durationPanel (suffix) {
  return {
    id: `http_req_duration_${suffix}`,
    title: `Request Duration ${suffix}`,
    metric: `http_req_duration_trend_${suffix}`,
    format: 'duration'
  }
}

// copy vus and http_reqs panel from default config
const overview = defaultConfig.tab('overview_snapshot')

// define custom panels
const customPanels = [
  overview.panel('vus'),
  overview.panel('http_reqs'),
  durationPanel('avg'),
  durationPanel('p(90)'),
  durationPanel('p(95)'),
  durationPanel('p(99)')
]

// copy http_req_duration chart form default config...
const durationChart = { ...overview.chart('http_req_duration') }

// ... and add p(99)
addP99(durationChart)

// define custom tab
const customTab = {
  id: 'custom',
  title: 'Custom',
  event: overview.event,
  panels: customPanels,
  charts: [overview.chart('http_reqs'), durationChart],
  description: 'Example of customizing the display of metrics.'
}

// add custom tab to configuration
defaultConfig.tabs.push(customTab)

export default defaultConfig
