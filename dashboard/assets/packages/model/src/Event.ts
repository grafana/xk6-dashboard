export enum EventType {
  config = "config",
  param = "param",
  start = "start",
  stop = "stop",
  metric = "metric",
  snapshot = "snapshot",
  cumulative = "cumulative",
  threshold = "threshold"
}

export type ConfigEvent = {
  type: EventType.config
  data: Record<string, unknown>
}

export type ParamEvent = {
  type: EventType.param
  data: Record<string, unknown>
}

export type StartEvent = {
  type: EventType.start
  data: Array<Array<number>>
}

export type StopEvent = {
  type: EventType.stop
  data: Array<Array<number>>
}

export type MetricEvent = {
  type: EventType.metric
  data: Record<string, Record<string, object>>
}

export type SnapshotEvent = {
  type: EventType.snapshot
  data: Array<Array<number>>
}

export type CumulativeEvent = {
  type: EventType.cumulative
  data: Array<Array<number>>
}

export type ThresholdEvent = {
  type: EventType.threshold
  data: Record<string, Array<string>>
}

export type DashboardEvent =
  | ConfigEvent
  | ParamEvent
  | StartEvent
  | StopEvent
  | MetricEvent
  | SnapshotEvent
  | CumulativeEvent
  | ThresholdEvent
