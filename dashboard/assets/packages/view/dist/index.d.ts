import { UnitType, SamplesView, Digest, Samples } from '@xk6-dashboard/model';
import { Serie, Section } from './config.js';
export { Panel, PanelKind } from './config.js';
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
    constructor(digest: Digest, series: Serie[], colors: Color[]);
    get empty(): boolean;
    buildSeries(input: Serie[], colors: Color[]): {
        stroke: string;
        fill: string;
        value: (self: never, val: number, seriesIdx: never, dataIdx: never) => string;
        points: {
            show: boolean;
        };
        label: string;
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

declare function isEmptySection(section: Section, samples: Samples): boolean;

export { Section, Serie, SeriesPlot, dateFormats, format, isEmptySection, tooltipPlugin };
