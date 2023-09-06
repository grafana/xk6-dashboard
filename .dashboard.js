// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

//@ts-check
/**
 * @typedef {import('./config').dashboard.Config} Config
 * @typedef {import('./config').dashboard.Tab} Tab
 * @typedef {import('./config').dashboard.Panel} Panel
 * @typedef {import('./config').dashboard.Chart} Chart
 */

/**
 * Customize dashboard configuration.
 * @param {Config} config default dashboard configuration
 * @returns {Config} modified dashboard configuration
 */
export default function (config) {
  /**
   * Search for an array element that has a given id property value.
   * @param {string} id the id for the search
   * @returns the first element whose id property matches or is undefined if there are no results
   */
  function getById(id) {
    return this.filter((/** @type {{ id: string; }} */ element) => element.id == id).at(0)
  }

  // add getById method to all array
  Array.prototype["getById"] = getById

  /**
   * helper for adding p(99) to existing chart
   * @param {Chart} chart 
   */
  function addP99 (chart) {
    chart.series = Object.assign({}, chart.series)
    chart.series['http_req_duration.p(99)'] = { label: 'p(99)', format: 'duration' }
  }

  /**
   * define request duration panel
   * @param {string} suffix 
   * @returns {Panel} panel
   */
  function durationPanel (suffix) {
    return {
      id: `http_req_duration_${suffix}`,
      title: `HTTP Request Duration ${suffix}`,
      metric: `http_req_duration_trend_${suffix}`,
      format: 'duration'
    }
  }
  
  /**
   * reference to overview tab from default config
   * @type {Tab}
   */
  const overview = config.tabs.getById('overview_snapshot')

  /**
   * define custom panels
   * @type {Panel[]}
   */
  const customPanels = [
    overview.panels.getById('vus'),
    overview.panels.getById('http_reqs'),
    durationPanel('avg'),
    durationPanel('p(90)'),
    durationPanel('p(95)'),
    durationPanel('p(99)')
  ]

  /**
   * copy of the http_req_duration chart form default config
   * @type {Chart}
   */
  const durationChart = Object.assign({}, overview.charts.getById('http_req_duration'))

  // and add p(99)
  addP99(durationChart)

  /**
   * custom tab definition
   * @type {Tab}
   */
  const customTab = {
    id: 'custom',
    title: 'Custom',
    event: overview.event,
    panels: customPanels,
    charts: [overview.charts.getById('http_reqs'), durationChart],
    description: 'Example of customizing the display of metrics.'
  }

  // add custom tab to configuration
  config.tabs.push(customTab)

  return config
}
