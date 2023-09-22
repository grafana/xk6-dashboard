import { Metrics, Aggregate } from "./Metrics.ts"
import { Samples } from "./Samples.ts"
import { Summary } from "./Summary.ts"

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

export enum EventType {
  config = "config",
  param = "param",
  start = "start",
  stop = "stop",
  metric = "metric",
  snapshot = "snapshot",
  cumulative = "cumulative"
}

export class Digest implements EventListenerObject {
  config: Config
  param: Param
  start?: Date
  stop?: Date
  metrics: Metrics
  samples: Samples
  summary: Summary

  constructor({
    config = {} as Config,
    param = {} as Param,
    start = undefined,
    stop = undefined,
    metrics = new Metrics(),
    samples = new Samples(),
    summary = new Summary()
  } = {}) {
    this.config = config
    this.param = param
    this.start = start
    this.stop = stop
    this.metrics = metrics
    this.samples = samples
    this.summary = summary
  }

  handleEvent(event: MessageEvent): void {
    const type = event.type as EventType
    const data = JSON.parse(event.data)

    this.onEvent(type, data)
  }

  onEvent(type: EventType, data: Record<string, Aggregate>): void {
    switch (type) {
      case EventType.config:
        this.onConfig(data)
        break
      case EventType.param:
        this.onParam(data)
        break
      case EventType.start:
        this.onStart(data)
        break
      case EventType.stop:
        this.onStop(data)
        break
      case EventType.metric:
        this.onMetric(data)
        break
      case EventType.snapshot:
        this.onSnapshot(data)
        break
      case EventType.cumulative:
        this.onCumulative(data)
        break
    }
  }

  private onConfig(data: Record<string, Aggregate>): void {
    Object.assign(this.config, data)
  }

  private onParam(data: Record<string, Aggregate>): void {
    Object.assign(this.param, data)
  }

  private onStart(data: Record<string, Aggregate>): void {
    if (data["time"] && data["time"].value) {
      this.start = new Date(data["time"].value)
    }
  }

  private onStop(data: Record<string, Aggregate>): void {
    if (data["time"] && data["time"].value) {
      this.start = new Date(data["time"].value)
    }
  }

  private onMetric(data: Record<string, Aggregate>): void {
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
}
