// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

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
    p90 = "p(90)",
    p95 = "p(95)",
    p99 = "p(99)"
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
};
declare class Query {
    metric: string;
    aggregate: AggregateType;
    constructor(metric: string, aggregate: AggregateType);
    static parse(query: string): Query;
}
declare class Metrics {
    values: Record<string, Metric>;
    constructor({ values }?: {
        values?: {} | undefined;
    });
    onEvent(data: Record<string, object>): void;
    find(query: string): Metric | undefined;
    unit(query: string): UnitType;
}

type SampleVectorInit = {
    length: number;
    capacity: number;
    aggregate: AggregateType;
    values?: number[];
    metric?: Metric;
    unit?: UnitType;
};
declare class SampleVector extends Array<number | undefined> {
    capacity: number;
    aggregate: AggregateType;
    metric?: Metric;
    unit: UnitType;
    empty: boolean;
    constructor({ length, capacity, values, aggregate, metric, unit }?: SampleVectorInit);
    [key: number]: number | undefined;
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
    constructor({ capacity, metrics, values }?: {
        capacity?: number | undefined;
        metrics?: Metrics | undefined;
        values?: Record<string, SampleVector> | undefined;
    });
    get length(): number;
    _push(name: string, value: number, prop?: AggregateType | undefined): void;
    onEvent(data: Record<string, Aggregate>): void;
    annotate(metrics: Metrics): void;
    select(queries: Array<string>): SamplesView;
}

type SummaryRowInit = {
    values?: Record<AggregateType, number>;
    metric?: Metric;
};
declare class SummaryRow {
    values: Record<AggregateType, number>;
    metric?: Metric;
    constructor({ values, metric }?: SummaryRowInit);
}
declare class Summary {
    values: Record<string, SummaryRow>;
    metrics: Metrics;
    time: number;
    constructor({ values, metrics, time }?: {
        values?: Record<string, SummaryRow> | undefined;
        metrics?: Metrics | undefined;
        time?: number | undefined;
    });
    onEvent(data: Record<string, Aggregate>): void;
    annotate(metrics: Metrics): void;
}

declare class Config implements Record<string, unknown> {
    constructor(from?: Record<string, unknown>);
    [x: string]: unknown;
}
declare class Param implements Record<string, unknown> {
    constructor(from?: Record<string, unknown>);
    [x: string]: unknown;
}
declare enum EventType {
    config = "config",
    param = "param",
    start = "start",
    stop = "stop",
    metric = "metric",
    snapshot = "snapshot",
    cumulative = "cumulative"
}
declare class Digest implements EventListenerObject {
    config: Config;
    param: Param;
    start?: Date;
    stop?: Date;
    metrics: Metrics;
    samples: Samples;
    summary: Summary;
    constructor({ config, param, start, stop, metrics, samples, summary }?: {
        config?: Config | undefined;
        param?: Param | undefined;
        start?: undefined;
        stop?: undefined;
        metrics?: Metrics | undefined;
        samples?: Samples | undefined;
        summary?: Summary | undefined;
    });
    handleEvent(event: MessageEvent): void;
    onEvent(type: EventType, data: Record<string, Aggregate>): void;
    private onConfig;
    private onParam;
    private onStart;
    private onStop;
    private onMetric;
    private onSnapshot;
    private onCumulative;
}

export { Config, Digest, EventType, Metric, MetricType, Metrics, Param, Query, SampleVector, SampleVectorInit, Samples, SamplesView, UnitType, ValueType };
