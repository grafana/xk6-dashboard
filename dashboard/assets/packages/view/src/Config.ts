// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

export class Serie {
  query: string
  legend: string
  constructor({ query, legend }: Serie) {
    this.query = query
    this.legend = legend
  }
}

export enum PanelKind {
  chart = "chart",
  stat = "stat",
  summary = "summary",
  trend = "trend"
}

export class Panel {
  title?: string
  id?: string
  kind?: PanelKind
  series: Serie[]
  constructor({ title, id, kind = PanelKind.chart, series = [] }: Panel = {} as Panel) {
    this.title = title
    this.id = id
    this.kind = kind
    this.series = series
  }
}

export class Section {
  title?: string
  id?: string
  summary?: string
  columns: number
  panels: Panel[]
  constructor({ title, id, summary, columns = 2, panels = [] }: Section = {} as Section) {
    this.title = title
    this.id = id
    this.summary = summary
    this.columns = columns
    this.panels = panels
  }
}

export class Tab {
  title?: string
  id?: string
  summary?: string
  report: boolean
  sections: Section[]
  constructor({ title, id, summary, report = true, sections = [] }: Tab = {} as Tab) {
    this.title = title
    this.id = id
    this.summary = summary
    this.sections = sections
    this.report = report
  }
}

export class Config {
  title?: string
  tabs: Tab[]
  constructor({ title, tabs = [] }: Config = {} as Config) {
    this.title = title
    this.tabs = tabs
  }
}

function getargs(args: unknown[], obj: Record<string, unknown>): unknown[] {
  const ret = [] as unknown[]
  let idx = 0

  ret.push(typeof args[idx] == "string" ? args[idx++] : undefined)
  ret.push(typeof args[idx] == "string" ? args[idx++] : undefined)
  ret.push(typeof args[idx] == "object" ? Object.assign(obj, args[idx++]) : obj)
  ret.push(typeof args[idx] == "function" ? args[idx++] : () => {})

  return ret
}

type UnknownFunction = {
  (...args: unknown[]): unknown
}

type TabFunction = {
  ({ tab, section }: { tab: Tab; section: SectionFunction }): void
}

type SectionFunction = {
  ({ section, panel }: { section: Section; panel: PanelFunction }): void
}

type PanelFunction = {
  ({ panel, serie }: { panel: Panel; serie: SerieFunction }): void
}

type SerieFunction = {
  ({ serie }: { serie: Serie }): void
}

type ConfigInterceptorFunction = {
  (config: Config, options: { tab: TabFunction }): Config
}

export class ConfigBuilder {
  config: Config
  currentTab?: Tab
  currentSection?: Section
  currentPanel?: Panel
  handlers: Record<string, UnknownFunction>

  constructor() {
    this.config = new Config()
    this.handlers = {
      tab: this.tab,
      section: this.section,
      panel: this.panel,
      serie: this.serie
    } as Record<string, UnknownFunction>
  }

  call(method: string): unknown {
    return (...args: unknown[]) => this.handlers[method].call(this, ...args)
  }

  tab(...args: unknown[]) {
    const [title, summary, obj, fn] = getargs(args, { sections: [] })

    const self = obj as Tab

    self.title = title as string
    self.summary = summary as string
    if (!self.id) {
      self.id = `tab-${this.config.tabs?.length}`
    }

    this.currentTab = self

    const fun: TabFunction = fn as TabFunction

    fun({ tab: self, section: this.call(this.section.name) as SectionFunction })

    this.config.tabs?.push(self)

    delete this.currentTab
  }

  section(...args: unknown[]) {
    const [title, summary, obj, fn] = getargs(args, { panels: [], columns: 2 })

    const self = obj as Section

    self.title = title as string
    self.summary = summary as string
    if (!self.id) {
      self.id = `${this.currentTab?.id}.section-${this.currentTab?.sections.length}`
    }

    this.currentSection = self

    const fun: SectionFunction = fn as SectionFunction

    fun({ section: self, panel: this.call(this.panel.name) as PanelFunction })

    if (self.columns == 2) {
      for (let i = 0; i < (self.panels?.length ?? 0); i++) {
        if (self.panels[i].kind == "stat") {
          self.columns = 6
          break
        }
      }
    }

    this.currentTab?.sections.push(self)

    delete this.currentSection
  }

  panel(...args: unknown[]) {
    const [title, kind, obj, fn] = getargs(args, { series: [] })

    const self = obj as Panel

    self.title = title as string

    if (kind) {
      self.kind = kind as PanelKind
    }

    if (!self.id) {
      self.id = `${this.currentSection?.id}.panel-${this.currentSection?.panels.length}`
    }

    this.currentPanel = self

    const fun = fn as PanelFunction

    fun({ panel: self, serie: this.call(this.serie.name) as SerieFunction })

    if (!self.kind) {
      self.kind = self.series.length < 2 ? PanelKind.stat : PanelKind.chart
    }

    if (self.kind == PanelKind.trend) {
      const serie = self.series[0].query
      self.series = []

      const aggregates = ["avg", "p(90)", "p(95)", "p(99)"]
      aggregates.forEach((aggregate) => {
        self.series.push({
          query: `${serie}.${aggregate}`,
          legend: aggregate
        })
      })
      self.kind = PanelKind.chart
    }

    this.currentSection?.panels.push(self)

    delete this.currentPanel
  }

  serie(...args: unknown[]) {
    const [query, legend, obj] = getargs(args, {})

    const self = obj as Serie

    self.query = query as string
    self.legend = legend as string

    if (self.query == undefined) {
      self.query = self.legend
    }

    this.currentPanel?.series.push(self)
  }

  static build(generator: ConfigInterceptorFunction): Config {
    const builder = new ConfigBuilder()

    return generator(builder.config, { tab: (...args: unknown[]) => builder.tab.call(builder, ...args) })
  }
}
