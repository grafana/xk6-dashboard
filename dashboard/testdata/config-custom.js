//@ts-check
/**
 * @typedef {import('../../config').dashboard.Config} Config
 * @typedef {import('../../config').dashboard.Tab} Tab
 * @typedef {import('../../config').dashboard.Panel} Panel
 * @typedef {import('../../config').dashboard.Chart} Chart
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

  // helper for adding p(99) to existing chart
  function addP99(chart) {
    chart.series["http_req_duration_trend_p(99)"] = { label: "p(99)" };
  }

  // add p(99) to overview panels request duration charts
  addP99(config.tabs.getById("overview_snapshot").charts.getById("http_req_duration"));

  return config
}
