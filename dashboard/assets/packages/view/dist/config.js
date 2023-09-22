// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

// src/Config.ts
var Serie = class {
  query;
  legend;
  constructor({ query, legend }) {
    this.query = query;
    this.legend = legend;
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
var Tab = class {
  title;
  id;
  summary;
  report;
  sections;
  constructor({ title, id, summary, report = true, sections = [] } = {}) {
    this.title = title;
    this.id = id;
    this.summary = summary;
    this.sections = sections;
    this.report = report;
  }
};
var Config = class {
  title;
  tabs;
  constructor({ title, tabs = [] } = {}) {
    this.title = title;
    this.tabs = tabs;
  }
};
function getargs(args, obj) {
  const ret = [];
  let idx = 0;
  ret.push(typeof args[idx] == "string" ? args[idx++] : void 0);
  ret.push(typeof args[idx] == "string" ? args[idx++] : void 0);
  ret.push(typeof args[idx] == "object" ? Object.assign(obj, args[idx++]) : obj);
  ret.push(typeof args[idx] == "function" ? args[idx++] : () => {
  });
  return ret;
}
var ConfigBuilder = class _ConfigBuilder {
  config;
  currentTab;
  currentSection;
  currentPanel;
  handlers;
  constructor() {
    this.config = new Config();
    this.handlers = {
      tab: this.tab,
      section: this.section,
      panel: this.panel,
      serie: this.serie
    };
  }
  call(method) {
    return (...args) => this.handlers[method].call(this, ...args);
  }
  tab(...args) {
    var _a, _b;
    const [title, summary, obj, fn] = getargs(args, { sections: [] });
    const self = obj;
    self.title = title;
    self.summary = summary;
    if (!self.id) {
      self.id = `tab-${(_a = this.config.tabs) == null ? void 0 : _a.length}`;
    }
    this.currentTab = self;
    const fun = fn;
    fun({ tab: self, section: this.call(this.section.name) });
    (_b = this.config.tabs) == null ? void 0 : _b.push(self);
    delete this.currentTab;
  }
  section(...args) {
    var _a, _b, _c, _d;
    const [title, summary, obj, fn] = getargs(args, { panels: [], columns: 2 });
    const self = obj;
    self.title = title;
    self.summary = summary;
    if (!self.id) {
      self.id = `${(_a = this.currentTab) == null ? void 0 : _a.id}.section-${(_b = this.currentTab) == null ? void 0 : _b.sections.length}`;
    }
    this.currentSection = self;
    const fun = fn;
    fun({ section: self, panel: this.call(this.panel.name) });
    if (self.columns == 2) {
      for (let i = 0; i < (((_c = self.panels) == null ? void 0 : _c.length) ?? 0); i++) {
        if (self.panels[i].kind == "stat") {
          self.columns = 6;
          break;
        }
      }
    }
    (_d = this.currentTab) == null ? void 0 : _d.sections.push(self);
    delete this.currentSection;
  }
  panel(...args) {
    var _a, _b, _c;
    const [title, kind, obj, fn] = getargs(args, { series: [] });
    const self = obj;
    self.title = title;
    if (kind) {
      self.kind = kind;
    }
    if (!self.id) {
      self.id = `${(_a = this.currentSection) == null ? void 0 : _a.id}.panel-${(_b = this.currentSection) == null ? void 0 : _b.panels.length}`;
    }
    this.currentPanel = self;
    const fun = fn;
    fun({ panel: self, serie: this.call(this.serie.name) });
    if (!self.kind) {
      self.kind = self.series.length < 2 ? "stat" /* stat */ : "chart" /* chart */;
    }
    if (self.kind == "trend" /* trend */) {
      const serie = self.series[0].query;
      self.series = [];
      const aggregates = ["avg", "p(90)", "p(95)", "p(99)"];
      aggregates.forEach((aggregate) => {
        self.series.push({
          query: `${serie}.${aggregate}`,
          legend: aggregate
        });
      });
      self.kind = "chart" /* chart */;
    }
    (_c = this.currentSection) == null ? void 0 : _c.panels.push(self);
    delete this.currentPanel;
  }
  serie(...args) {
    var _a;
    const [query, legend, obj] = getargs(args, {});
    const self = obj;
    self.query = query;
    self.legend = legend;
    if (self.query == void 0) {
      self.query = self.legend;
    }
    (_a = this.currentPanel) == null ? void 0 : _a.series.push(self);
  }
  static build(generator) {
    const builder = new _ConfigBuilder();
    return generator(builder.config, { tab: (...args) => builder.tab.call(builder, ...args) });
  }
};
export {
  Config,
  ConfigBuilder,
  Panel,
  PanelKind,
  Section,
  Serie,
  Tab
};
