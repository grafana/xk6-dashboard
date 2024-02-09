// src/format.ts
import numeral from "numeral";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";
import uPlot from "uplot";
import { UnitType } from "@xk6-dashboard/model";
function formatDuration(value, compact) {
  let [main, sub] = prettyMilliseconds(value, {
    formatSubMilliseconds: true,
    compact
  }).split(" ").slice(0, 2);
  if (main.match(/[0-9]+s/) && !compact) {
    main = main.replace("s", ".");
    if (sub) {
      sub = sub.substring(0, 1);
    } else {
      sub = "0";
    }
    return main + sub + "s";
  }
  if (sub) {
    main += " " + sub;
  }
  return main;
}
function formatBytes(value) {
  return prettyBytes(value);
}
var formatDate = uPlot.fmtDate("{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}");
function format(type, value, compact = false) {
  switch (type) {
    case UnitType.duration:
      return formatDuration(value, compact);
    case UnitType.bytes:
      return formatBytes(value);
    case UnitType.bps:
      return formatBytes(value) + "/s";
    case UnitType.counter:
      return numeral(value).format("0.[0]a");
    case UnitType.rps:
      return numeral(value).format("0.[00]a") + "/s";
    case UnitType.timestamp:
      return formatDate(new Date(value * 1e3));
    default:
      return isNaN(value) || value == null ? "0" : value.toFixed(2);
  }
}
var dateFormats = [
  // tick incr          default           year                             month    day                       hour     min             sec       mode
  [3600 * 24 * 365, "{YYYY}", null, null, null, null, null, null, 1],
  [3600 * 24 * 28, "{MMM}", "\n{YYYY}", null, null, null, null, null, 1],
  [3600 * 24, "{MM}-{DD}", "\n{YYYY}", null, null, null, null, null, 1],
  [3600, "{HH}", "\n{YYYY}-{MM}-{DD}", null, "\n{MM}-{DD}", null, null, null, 1],
  [60, "{HH}:{mm}", "\n{YYYY}-{MM}-{DD}", null, "\n{MM}-{DD}", null, null, null, 1],
  [1, ":{ss}", "\n{YYYY}-{MM}-{DD} {HH}:{mm}", null, "\n{MM}-{DD} {HH}:{mm}", null, "\n{HH}:{mm}", null, 1],
  [1e-3, ":{ss}.{fff}", "\n{YYYY}-{MM}-{DD} {HH}:{mm}", null, "\n{MM}-{DD} {HH}:{mm}", null, "\n{HH}:{mm}", null, 1]
];

// src/SeriesPlot.ts
function formatter(unit) {
  return function(self, val, seriesIdx, dataIdx) {
    return dataIdx == null ? "--" : val == null ? "" : format(unit, val);
  };
}
var SeriesPlot = class {
  samples;
  series;
  constructor(digest, panel, colors) {
    const queries = panel.series.map((item) => item.query);
    this.samples = digest.samples.select(queries);
    if (!this.samples.empty) {
      this.series = this.buildSeries(panel.series, colors);
    }
  }
  get empty() {
    return this.samples.empty;
  }
  get data() {
    const all = new Array();
    for (let i = 0; i < this.samples.length; i++) {
      all.push(this.samples[i].values);
    }
    return all;
  }
  buildSeries(input, colors) {
    if (input[0].query != "time") {
      input = [{ query: "time", legend: "time" }, ...input];
    }
    const series = [];
    for (let i = 0; i < this.samples.length; i++) {
      const pidx = i % colors.length;
      let legend2 = this.samples[i].legend;
      if (i < input.length && input[i].legend && input[i].legend.length > 0) {
        legend2 = input[i].legend;
      }
      series.push({
        stroke: colors[pidx].stroke,
        fill: colors[pidx].fill,
        value: formatter(this.samples[i].unit),
        points: { show: false },
        label: legend2,
        scale: this.samples[i].unit
      });
    }
    return series;
  }
};

// src/tooltip.ts
function tooltipPlugin(background) {
  let tooltip;
  function init(u) {
    tooltip = document.createElement("div");
    const style = {
      display: "none",
      position: "absolute",
      padding: "1rem",
      border: "1px solid #7b65fa",
      zIndex: "10",
      pointerEvents: "none",
      fontSize: "1.25rem"
    };
    Object.assign(tooltip.style, style);
    u.over.appendChild(tooltip);
    u.over.onmouseleave = () => {
      tooltip.style.display = "none";
    };
    u.over.onmouseenter = () => {
      tooltip.style.display = "block";
    };
  }
  function ready(u) {
    update(u);
  }
  function update(u) {
    const bound = u.over.getBoundingClientRect();
    tooltip.style.background = background;
    const inner = legend(u);
    if (!inner) {
      tooltip.style.display = "none";
      return;
    }
    tooltip.innerHTML = inner;
    const { left: leftVal, top: topVal } = u.cursor;
    const left = leftVal ?? 0;
    const top = topVal ?? 0;
    tooltip.innerHTML = inner;
    if (left < bound.width / 2) {
      tooltip.style.left = Math.max(0, left) + "px";
      tooltip.style.right = "unset";
    } else {
      tooltip.style.right = Math.max(0, bound.width - left) + "px";
      tooltip.style.left = "unset";
    }
    if (top < bound.height / 2) {
      tooltip.style.top = Math.max(0, top) + "px";
      tooltip.style.bottom = "unset";
    } else {
      tooltip.style.bottom = Math.max(0, bound.height - top) + "px";
      tooltip.style.top = "unset";
    }
  }
  return {
    hooks: {
      init,
      ready,
      setCursor: update,
      setData: (u) => u.over.focus()
    }
  };
}
function legend(u) {
  const { idx } = u.cursor;
  if (idx == void 0) {
    return "";
  }
  let caption;
  if (u.legend.values) {
    caption = u.legend.values[0]._;
  } else {
    caption = "";
  }
  let buff = `<table><caption style="white-space: nowrap;caption-side:top;background-color: unset;border:unset;">${caption}</caption><tbody>`;
  for (let i = 1; i < u.series.length; i++) {
    let stroke = "";
    let fill = "";
    if (u.legend.markers != void 0) {
      let fnOrStr = u.legend.markers.stroke != void 0 ? u.legend.markers.stroke : "";
      stroke = typeof fnOrStr == "string" ? fnOrStr : fnOrStr(u, i);
      fnOrStr = u.legend.markers.fill != void 0 ? u.legend.markers.fill : "";
      fill = typeof fnOrStr == "string" ? fnOrStr : fnOrStr(u, i);
    }
    const legend2 = u.series[i].label ?? "";
    const value = u.legend.values ? u.legend.values[i]._ : "";
    buff += `<tr><td style="text-align: left;padding: 0.1rem;">${box(
      stroke,
      fill
    )}</td><td style="text-align: left;padding: 0.1rem;">${legend2}</td><td style="text-align: right;">${value}</td></tr>`;
  }
  buff += `</tbody></table>`;
  return buff;
}
function box(stroke, fill) {
  return `<svg width="0.8rem" height="0.8rem"><rect width="0.8rem" height="0.8rem" style="fill:${fill};stroke-width:3;stroke:${stroke}" /></svg>`;
}

// src/Config.ts
var Serie = class {
  query;
  legend;
  constructor({ query, legend: legend2 }) {
    this.query = query;
    this.legend = legend2;
  }
};
var PanelKind = /* @__PURE__ */ ((PanelKind2) => {
  PanelKind2["chart"] = "chart";
  PanelKind2["stat"] = "stat";
  PanelKind2["summary"] = "summary";
  return PanelKind2;
})(PanelKind || {});
var Panel = class {
  title;
  id;
  summary;
  kind;
  series;
  fullWidth;
  constructor({ title, id, fullWidth, summary, kind = "chart" /* chart */, series = [] } = {}) {
    this.title = title;
    this.id = id;
    this.summary = summary;
    this.kind = kind;
    this.series = series;
    this.fullWidth = fullWidth;
  }
};
var Section = class {
  title;
  id;
  summary;
  panels;
  constructor({ title, id, summary, panels = [] } = {}) {
    this.title = title;
    this.id = id;
    this.summary = summary;
    this.panels = panels;
  }
};

// src/SummaryTable.ts
var SummaryTable = class {
  view;
  metrics;
  constructor(panel, digest) {
    this.metrics = digest.metrics;
    const queries = panel.series.map((item) => item.query);
    this.view = digest.summary.select(queries);
  }
  get empty() {
    return this.view.empty;
  }
  get cols() {
    return this.view.aggregates.length;
  }
  get header() {
    return new Array("metric", ...this.view.aggregates.map((a) => a));
  }
  get body() {
    const rows = new Array();
    for (let i = 0; i < this.view.length; i++) {
      const row = new Array();
      row.push(this.view[i].name);
      row.push(...this.view.aggregates.map((a) => this.format(this.view[i], a)));
      rows.push(row);
    }
    return rows;
  }
  format(row, aggregate) {
    var _a;
    const unit = this.metrics.unit(((_a = row.metric) == null ? void 0 : _a.name) ?? "", aggregate);
    return format(unit, row.values[aggregate], true);
  }
};

// src/helper.ts
function isEmptySection(section, digest) {
  for (let i = 0; i < section.panels.length; i++) {
    const panel = section.panels[i];
    if (!isEmptyPanel(panel, digest)) {
      return false;
    }
  }
  return true;
}
function isEmptyPanel(panel, digest) {
  if (panel.kind == "summary" /* summary */) {
    return isEmptySummary(panel, digest);
  }
  return isEmptyPlot(panel, digest);
}
function isEmptyPlot(panel, digest) {
  const plot = digest.samples.select(panel.series.map((s) => s.query));
  return plot.empty;
}
function isEmptySummary(panel, digest) {
  const view = digest.summary.select(panel.series.map((s) => s.query));
  return view.empty;
}
export {
  Panel,
  PanelKind,
  Section,
  Serie,
  SeriesPlot,
  SummaryTable,
  dateFormats,
  format,
  isEmptySection,
  tooltipPlugin
};
