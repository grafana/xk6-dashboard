// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

// src/format.ts
import numeral from "numeral";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";
import uPlot from "uplot";
import { UnitType } from "@xk6-dashboard/model";
function formatDuration(value, compact) {
  return prettyMilliseconds(value, {
    formatSubMilliseconds: true,
    compact
  }).split(" ").slice(0, 2).join(" ");
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
  constructor(digest, series, colors) {
    const queries = series.map((item) => item.query);
    this.samples = digest.samples.select(queries);
    if (!this.samples.empty) {
      this.series = this.buildSeries(series, colors);
    }
  }
  get empty() {
    return this.samples.empty;
  }
  buildSeries(input, colors) {
    if (input[0].query != "time") {
      input = [{ query: "time", legend: "time" }, ...input];
    }
    const series = [];
    for (let i = 0; i < input.length; i++) {
      const pidx = i % colors.length;
      series.push({
        stroke: colors[pidx].stroke,
        fill: colors[pidx].fill,
        value: formatter(this.samples[i].unit),
        points: { show: false },
        label: input[i].legend
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
      padding: "0.2rem",
      border: "1px solid #7b65fa",
      zIndex: "10",
      pointerEvents: "none",
      margin: "0.5rem",
      fontSize: "smaller"
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
  PanelKind2["trend"] = "trend";
  return PanelKind2;
})(PanelKind || {});
var Panel = class {
  title;
  id;
  kind;
  series;
  constructor({ title, id, kind = "chart" /* chart */, series = [] } = {}) {
    this.title = title;
    this.id = id;
    this.kind = kind;
    this.series = series;
  }
};
var Section = class {
  title;
  id;
  summary;
  columns;
  panels;
  constructor({ title, id, summary, columns = 2, panels = [] } = {}) {
    this.title = title;
    this.id = id;
    this.summary = summary;
    this.columns = columns;
    this.panels = panels;
  }
};

// src/helper.ts
function isEmptySection(section, samples) {
  for (let i = 0; i < section.panels.length; i++) {
    for (let j = 0; j < section.panels[i].series.length; j++) {
      const vect = samples.values[section.panels[i].series[j].query];
      if (vect != void 0 && !vect.empty) {
        return false;
      }
    }
  }
  return true;
}
export {
  Panel,
  PanelKind,
  Section,
  Serie,
  SeriesPlot,
  dateFormats,
  format,
  isEmptySection,
  tooltipPlugin
};
