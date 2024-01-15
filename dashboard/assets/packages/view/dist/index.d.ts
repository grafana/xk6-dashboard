import { UnitType, SamplesView, Digest, SummaryView, Metrics, SummaryRow, AggregateType } from '@xk6-dashboard/model';
import { Panel, Serie, Section } from './config.js';
export { PanelKind } from './config.js';
import uPlot from 'uplot';

declare function format(type: UnitType, value: number, compact?: boolean): string;
declare const dateFormats: (string | number | null)[][];

type Color = {
    stroke: string;
    fill: string;
};
declare class SeriesPlot {
    samples: SamplesView;
    series?: object;
    constructor(digest: Digest, panel: Panel, colors: Color[]);
    get empty(): boolean;
    get data(): (number | undefined)[][];
    buildSeries(input: Serie[], colors: Color[]): {
        stroke: string;
        fill: string;
        value: (self: never, val: number, seriesIdx: never, dataIdx: never) => string;
        points: {
            show: boolean;
        };
        label: string;
        scale: UnitType;
    }[];
}

declare function tooltipPlugin(background: string): {
    hooks: {
        init: (u: uPlot) => void;
        ready: (u: uPlot) => void;
        setCursor: (u: uPlot) => void;
        setData: (u: uPlot) => void;
    };
};

declare class SummaryTable {
    view: SummaryView;
    metrics: Metrics;
    constructor(panel: Panel, digest: Digest);
    get empty(): boolean;
    get cols(): number;
    get header(): Array<string>;
    get body(): Array<Array<string>>;
    format(row: SummaryRow, aggregate: AggregateType): string;
}

declare function isEmptySection(section: Section, digest: Digest): boolean;

export { Panel, Section, Serie, SeriesPlot, SummaryTable, dateFormats, format, isEmptySection, tooltipPlugin };
