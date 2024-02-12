declare const enum UnitType {
    bytes = "bytes",
    bps = "bps",
    counter = "counter",
    rps = "rps",
    duration = "duration",
    timestamp = "timestamp",
    unknown = ""
}

declare enum AggregateType {
    value = "value",
    count = "count",
    rate = "rate",
    avg = "avg",
    min = "min",
    max = "max",
    med = "med",
    p90 = "p90",
    p95 = "p95",
    p99 = "p99"
}
type Aggregate = {
    [x in AggregateType]: number;
};
declare const enum ValueType {
    time = "time",
    data = "data",
    default = "default"
}
declare const enum MetricType {
    gauge = "gauge",
    counter = "counter",
    rate = "rate",
    trend = "trend"
}
type Metric = {
    name: string;
    contains?: ValueType;
    type?: MetricType;
    custom?: boolean;
};
declare class Query {
    name: string;
    aggregate?: AggregateType;
    constructor(query: string);
}
declare class Metrics {
    values: Record<string, Metric>;
    names: Array<string>;
    _aggregates: Record<MetricType, Array<AggregateType>>;
    constructor({ values, names }?: {
        values?: {} | undefined;
        names?: never[] | undefined;
    });
    set aggregates(value: Record<MetricType, Array<string>>);
    onEvent(data: Record<string, object>): void;
    toAggregate(data: Array<Array<number>>): Record<string, Aggregate>;
    find(query: string): Metric | undefined;
    unit(name: string, aggregate?: AggregateType): UnitType;
}

declare enum EventType {
    config = "config",
    param = "param",
    start = "start",
    stop = "stop",
    metric = "metric",
    snapshot = "snapshot",
    cumulative = "cumulative",
    threshold = "threshold"
}
type ConfigEvent = {
    type: EventType.config;
    data: Record<string, unknown>;
};
type ParamEvent = {
    type: EventType.param;
    data: Record<string, unknown>;
};
type StartEvent = {
    type: EventType.start;
    data: Array<Array<number>>;
};
type StopEvent = {
    type: EventType.stop;
    data: Array<Array<number>>;
};
type MetricEvent = {
    type: EventType.metric;
    data: Record<string, Record<string, object>>;
};
type SnapshotEvent = {
    type: EventType.snapshot;
    data: Array<Array<number>>;
};
type CumulativeEvent = {
    type: EventType.cumulative;
    data: Array<Array<number>>;
};
type ThresholdEvent = {
    type: EventType.threshold;
    data: Record<string, Array<string>>;
};
type DashboardEvent = ConfigEvent | ParamEvent | StartEvent | StopEvent | MetricEvent | SnapshotEvent | CumulativeEvent | ThresholdEvent;

type SampleVectorInit = {
    length: number;
    capacity: number;
    aggregate: AggregateType;
    values?: number[];
    metric?: Metric;
    unit?: UnitType;
    tags?: Record<string, string>;
    group?: string;
    name: string;
};
declare class SampleVector {
    capacity: number;
    aggregate: AggregateType;
    metric?: Metric;
    unit: UnitType;
    empty: boolean;
    name: string;
    tags?: Record<string, string>;
    group?: string;
    values: Array<number | undefined>;
    constructor({ length, capacity, values, aggregate, metric, unit, name, tags, group }?: SampleVectorInit);
    hasTags(): boolean;
    formatTags(): string;
    get legend(): string;
    grow(length: number): void;
    push(...items: number[]): number;
}
declare class SamplesView extends Array<SampleVector> {
    constructor(time?: SampleVector);
    [key: number]: SampleVector;
    get empty(): boolean;
    get units(): UnitType[];
}
declare class Samples {
    private capacity;
    private metrics;
    values: Record<string, SampleVector>;
    vectors: Record<string, SampleVector>;
    lookup: Record<string, Array<SampleVector>>;
    constructor({ capacity, metrics }?: {
        capacity?: number | undefined;
        metrics?: Metrics | undefined;
    });
    get length(): number;
    _push(name: string, value: number, aggregate?: AggregateType | undefined): void;
    newSampleVector(name: string, aggregate?: AggregateType | undefined): SampleVector;
    onEvent(data: Record<string, Aggregate>): void;
    annotate(metrics: Metrics): void;
    select(queries: Array<string>): SamplesView;
    query(expr: string): SampleVector | undefined;
    queryAll(expr: string): Array<SampleVector>;
}

type SummaryRowInit = {
    values: Aggregate;
    metric?: Metric;
    name: string;
};
declare class SummaryRow {
    values: Aggregate;
    metric?: Metric;
    name: string;
    tags?: Record<string, string>;
    group?: string;
    constructor({ values, metric, name }?: SummaryRowInit);
}
declare class SummaryView extends Array<SummaryRow> {
    aggregates: Array<AggregateType>;
    constructor(values: Array<SummaryRow>);
    [key: number]: SummaryRow;
    get empty(): boolean;
}
declare class Summary {
    values: Record<string, SummaryRow>;
    lookup: Array<SummaryRow>;
    metrics: Metrics;
    time: number;
    constructor({ values, metrics, time }?: {
        values?: Record<string, SummaryRow> | undefined;
        metrics?: Metrics | undefined;
        time?: number | undefined;
    });
    onEvent(data: Record<string, Aggregate>): void;
    newSummaryRow(name: string, aggregate: Aggregate): SummaryRow;
    annotate(metrics: Metrics): void;
    select(queries: Array<string>): SummaryView;
    queryAll(expr: string): Array<SummaryRow>;
}

declare class Config implements Record<string, unknown> {
    constructor(from?: Record<string, unknown>);
    [x: string]: unknown;
}
declare class Param implements Record<string, unknown> {
    constructor(from?: Record<string, unknown>);
    [x: string]: unknown;
}
declare class Thresholds implements Record<string, Array<string>> {
    constructor(from?: Record<string, string[]>);
    [x: string]: Array<string>;
}
declare class Digest implements EventListenerObject {
    config: Config;
    param: Param;
    start?: Date;
    stop?: Date;
    metrics: Metrics;
    samples: Samples;
    summary: Summary;
    thresholds: Thresholds;
    constructor({ config, param, start, stop, metrics, samples, summary, thresholds }?: {
        config?: Config | undefined;
        param?: Param | undefined;
        start?: Date | undefined;
        stop?: Date | undefined;
        metrics?: Metrics | undefined;
        samples?: Samples | undefined;
        summary?: Summary | undefined;
        thresholds?: Thresholds | undefined;
    });
    handleEvent(event: MessageEvent): void;
    onEvent(event: DashboardEvent): void;
    private onConfig;
    private onParam;
    private onStart;
    private onStop;
    private onMetric;
    private onSnapshot;
    private onCumulative;
    private onThreshold;
}

export { Aggregate, AggregateType, Config, DashboardEvent, Digest, EventType, Metric, MetricType, Metrics, Param, Query, SampleVector, SampleVectorInit, Samples, SamplesView, Summary, SummaryRow, SummaryView, UnitType, ValueType };
