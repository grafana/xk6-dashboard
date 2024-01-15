declare class Serie {
    query: string;
    legend: string;
    constructor({ query, legend }: Serie);
}
declare enum PanelKind {
    chart = "chart",
    stat = "stat",
    summary = "summary"
}
declare class Panel {
    title?: string;
    id?: string;
    summary?: string;
    kind?: PanelKind;
    series: Serie[];
    fullWidth?: boolean;
    constructor({ title, id, fullWidth, summary, kind, series }?: Panel);
}
declare class Section {
    title?: string;
    id?: string;
    summary?: string;
    panels: Panel[];
    constructor({ title, id, summary, panels }?: Section);
}
declare class Tab {
    title?: string;
    id?: string;
    summary?: string;
    report: boolean;
    sections: Section[];
    constructor({ title, id, summary, report, sections }?: Tab);
}
declare class Config {
    title?: string;
    tabs: Tab[];
    constructor({ title, tabs }?: Config);
}
type UnknownFunction = {
    (...args: unknown[]): unknown;
};
type TabFunction = {
    ({ tab, section }: {
        tab: Tab;
        section: SectionFunction;
    }): void;
};
type SectionFunction = {
    ({ section, panel }: {
        section: Section;
        panel: PanelFunction;
    }): void;
};
type PanelFunction = {
    ({ panel, serie }: {
        panel: Panel;
        serie: SerieFunction;
    }): void;
};
type SerieFunction = {
    ({ serie }: {
        serie: Serie;
    }): void;
};
type ConfigInterceptorFunction = {
    (config: Config, options: {
        tab: TabFunction;
    }): Config;
};
declare class ConfigBuilder {
    config: Config;
    currentTab?: Tab;
    currentSection?: Section;
    currentPanel?: Panel;
    handlers: Record<string, UnknownFunction>;
    constructor();
    call(method: string): unknown;
    tab(...args: unknown[]): void;
    section(...args: unknown[]): void;
    panel(...args: unknown[]): void;
    serie(...args: unknown[]): void;
    static build(generator: ConfigInterceptorFunction): Config;
}

export { Config, ConfigBuilder, Panel, PanelKind, Section, Serie, Tab };
