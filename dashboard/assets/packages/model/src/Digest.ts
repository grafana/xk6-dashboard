// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Metrics, Aggregate, MetricType } from "./Metrics.ts"
import { Samples } from "./Samples.ts"
import { Summary } from "./Summary.ts"
import { EventType, DashboardEvent } from "./Event.ts"

export class Config implements Record<string, unknown> {
  constructor(from = {} as Record<string, unknown>) {
    Object.assign(this, from)
  }

  [x: string]: unknown
}
export class Param implements Record<string, unknown> {
  constructor(from = {} as Record<string, unknown>) {
    Object.assign(this, from)
  }

  [x: string]: unknown
}
export class Thresholds implements Record<string, Array<string>> {
  constructor(from = {} as Record<string, Array<string>>) {
    Object.assign(this, from)
  }

  [x: string]: Array<string>
}

export class Digest implements EventListenerObject {
  config: Config
  param: Param
  start?: Date
  stop?: Date
  metrics: Metrics
  samples: Samples
  summary: Summary
  thresholds: Thresholds

  constructor({
    config = {} as Config,
    param = {} as Param,
    start = undefined as Date | undefined,
    stop = undefined as Date | undefined,
    metrics = new Metrics(),
    samples = new Samples(),
    summary = new Summary(),
    thresholds = new Thresholds()
  } = {}) {
    this.config = config
    this.param = param
    this.start = start
    this.stop = stop
    this.metrics = metrics
    this.samples = samples
    this.summary = summary
    this.thresholds = thresholds
  }

  handleEvent(event: MessageEvent): void {
    const type = event.type as EventType
    const data = JSON.parse(event.data)

    this.onEvent({ type, data } as DashboardEvent)
  }

  onEvent(event: DashboardEvent): void {
    switch (event.type) {
      case EventType.config:
        this.onConfig(event.data)
        break
      case EventType.param:
        this.onParam(event.data)
        break
      case EventType.start:
        this.onStart(this.metrics.toAggregate(event.data))
        break
      case EventType.stop:
        this.onStop(this.metrics.toAggregate(event.data))
        break
      case EventType.metric:
        this.onMetric(event.data)
        break
      case EventType.snapshot:
        this.onSnapshot(this.metrics.toAggregate(event.data))
        break
      case EventType.cumulative:
        this.onCumulative(this.metrics.toAggregate(event.data))
        break
      case EventType.threshold:
        this.onThreshold(event.data)
        break
    }
  }

  private onConfig(data: Record<string, unknown>): void {
    Object.assign(this.config, data)
  }

  private onParam(data: Record<string, unknown>): void {
    Object.assign(this.param, data)
    this.metrics.aggregates = data["aggregates"] as Record<MetricType, Array<string>>
  }

  private onStart(data: Record<string, Aggregate>): void {
    if (data["time"] && data["time"].value) {
      this.start = new Date(data["time"].value)
    }
  }

  private onStop(data: Record<string, Aggregate>): void {
    if (data["time"] && data["time"].value) {
      this.stop = new Date(data["time"].value)
    }
  }

  private onMetric(data: Record<string, Record<string, object>>): void {
    this.metrics.onEvent(data)
    this.samples.annotate(this.metrics)
    this.summary.annotate(this.metrics)
  }

  private onSnapshot(data: Record<string, Aggregate>): void {
    this.samples.onEvent(data)
    this.samples.annotate(this.metrics)
  }

  private onCumulative(data: Record<string, Aggregate>): void {
    this.summary.onEvent(data)
    this.summary.annotate(this.metrics)
  }

  private onThreshold(data: Record<string, Array<string>>): void {
    Object.assign(this.thresholds, data)
  }
}
