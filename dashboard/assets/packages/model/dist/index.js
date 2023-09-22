// src/UnitType.ts
var UnitType = /* @__PURE__ */ ((UnitType2) => {
  UnitType2["bytes"] = "bytes";
  UnitType2["bps"] = "bps";
  UnitType2["counter"] = "counter";
  UnitType2["rps"] = "rps";
  UnitType2["duration"] = "duration";
  UnitType2["timestamp"] = "timestamp";
  UnitType2["unknown"] = "";
  return UnitType2;
})(UnitType || {});

// src/Metrics.ts
var AggregateType = /* @__PURE__ */ ((AggregateType2) => {
  AggregateType2["value"] = "value";
  AggregateType2["count"] = "count";
  AggregateType2["rate"] = "rate";
  AggregateType2["avg"] = "avg";
  AggregateType2["min"] = "min";
  AggregateType2["max"] = "max";
  AggregateType2["med"] = "med";
  AggregateType2["p90"] = "p(90)";
  AggregateType2["p95"] = "p(95)";
  AggregateType2["p99"] = "p(99)";
  return AggregateType2;
})(AggregateType || {});
var ValueType = /* @__PURE__ */ ((ValueType2) => {
  ValueType2["time"] = "time";
  ValueType2["data"] = "data";
  ValueType2["default"] = "default";
  return ValueType2;
})(ValueType || {});
var MetricType = /* @__PURE__ */ ((MetricType2) => {
  MetricType2["gauge"] = "gauge";
  MetricType2["counter"] = "counter";
  MetricType2["rate"] = "rate";
  MetricType2["trend"] = "trend";
  return MetricType2;
})(MetricType || {});
var Query = class _Query {
  metric;
  aggregate;
  constructor(metric, aggregate) {
    this.metric = metric;
    this.aggregate = aggregate;
  }
  static parse(query) {
    const [metric, aggregate] = query.split(".", 2);
    return new _Query(metric, aggregate);
  }
};
var propTime = "time";
var Metrics = class {
  values;
  constructor({ values = {} } = {}) {
    this.values = values;
  }
  onEvent(data) {
    for (const name in data) {
      this.values[name] = { ...data[name], name };
    }
  }
  find(query) {
    const q = Query.parse(query);
    return this.values[q.metric];
  }
  unit(query) {
    const metric = this.find(query);
    if (!metric) {
      return "" /* unknown */;
    }
    const q = Query.parse(query);
    if (!q.aggregate && query != propTime) {
      return "" /* unknown */;
    }
    switch (metric.type) {
      case "counter" /* counter */:
        switch (metric.contains) {
          case "data" /* data */:
            return q.aggregate == "count" /* count */ ? "bytes" /* bytes */ : "bps" /* bps */;
          default:
            return q.aggregate == "count" /* count */ ? "counter" /* counter */ : "rps" /* rps */;
        }
      case "rate" /* rate */:
        switch (metric.contains) {
          case "data" /* data */:
            return "bps" /* bps */;
          default:
            return "rps" /* rps */;
        }
      case "gauge" /* gauge */:
        switch (metric.contains) {
          case "time" /* time */:
            return metric.name == propTime ? "timestamp" /* timestamp */ : "duration" /* duration */;
          case "data" /* data */:
            return "bytes" /* bytes */;
          default:
            return "counter" /* counter */;
        }
      case "trend" /* trend */:
        switch (metric.contains) {
          case "time" /* time */:
            return "duration" /* duration */;
          case "data" /* data */:
            return "bps" /* bps */;
          default:
            return "rps" /* rps */;
        }
      default:
        return "" /* unknown */;
    }
  }
};

// src/Samples.ts
var propTime2 = "time";
var SampleVector = class extends Array {
  capacity;
  aggregate;
  metric;
  unit;
  empty;
  constructor({
    length = 0,
    capacity = 1e4,
    values = new Array(),
    aggregate = "value" /* value */,
    metric = void 0,
    unit = "" /* unknown */
  } = {}) {
    super(length);
    if (values.length > 0) {
      super.push(...values);
    }
    this.capacity = capacity;
    this.aggregate = aggregate;
    this.metric = metric;
    this.unit = unit;
    this.empty = values.length == 0;
  }
  grow(length) {
    this[length - 1] = void 0;
  }
  push(...items) {
    let shifted = false;
    items.forEach((item) => {
      super.push(item);
      this.empty = false;
      if (this.length == this.capacity) {
        this.shift();
        shifted = true;
      }
    });
    if (shifted) {
      this.empty = true;
      for (let i = 0; i < this.length; i++) {
        if (this[i] != void 0) {
          this.empty = false;
          break;
        }
      }
    }
    return this.length;
  }
};
var SamplesView = class extends Array {
  constructor(time) {
    super();
    if (Array.isArray(time)) {
      super.push(time);
    }
  }
  get empty() {
    if (this.length < 2) {
      return true;
    }
    for (let i = 1; i < this.length; i++) {
      if (!this[i].empty) {
        return false;
      }
    }
    return true;
  }
  get units() {
    const all = new Array();
    this.forEach((vect) => {
      if (vect.unit && !all.includes(vect.unit)) {
        all.push(vect.unit);
      }
    });
    return all;
  }
};
var Samples = class {
  capacity;
  metrics;
  values;
  constructor({ capacity = 1e4, metrics = new Metrics(), values = {} } = {}) {
    this.capacity = capacity;
    this.metrics = metrics;
    this.values = values;
  }
  get length() {
    return this.values[propTime2] ? this.values[propTime2].length : 0;
  }
  _push(name, value, prop = void 0) {
    const key = prop ? name + "." + prop : name;
    let array = this.values[key];
    if (!array) {
      array = new SampleVector({
        length: this.length,
        capacity: this.capacity,
        metric: this.metrics.values[key],
        unit: this.metrics.unit(key),
        aggregate: prop
      });
      this.values[key] = array;
    } else if (array.length < this.length) {
      array.grow(this.length);
    }
    array.push(value);
  }
  onEvent(data) {
    for (const name in data) {
      if (name == propTime2) {
        this._push(name, Math.floor(data[name].value / 1e3));
        continue;
      }
      for (const prop in data[name]) {
        const aggregate = prop;
        this._push(name, data[name][aggregate], aggregate);
      }
    }
  }
  annotate(metrics) {
    this.metrics = metrics;
    for (const key in this.values) {
      this.values[key].metric = metrics.find(key);
      this.values[key].unit = metrics.unit(key);
    }
  }
  select(queries) {
    const data = new SamplesView(this.values[propTime2]);
    if (data.length == 0) {
      return data;
    }
    for (const query of queries) {
      const [, aggregate] = query.split(".", 2);
      let array = this.values[query];
      if (!Array.isArray(array)) {
        array = new SampleVector({
          length: data[0].length,
          capacity: this.capacity,
          aggregate,
          metric: this.metrics.find(query),
          unit: this.metrics.unit(query)
        });
      }
      data.push(array);
    }
    return data;
  }
};

// src/Summary.ts
var SummaryRow = class {
  values;
  metric;
  constructor({ values = {}, metric } = {}) {
    this.values = values;
    this.metric = metric;
  }
};
var propTime3 = "time";
var Summary = class {
  values;
  metrics;
  time;
  constructor({ values = {}, metrics = new Metrics(), time = 0 } = {}) {
    this.values = values;
    this.metrics = metrics;
    this.time = time;
  }
  onEvent(data) {
    const values = {};
    let time = 0;
    for (const key in data) {
      if (key == propTime3) {
        time = Math.floor(data[key].value / 1e3);
        continue;
      }
      const metric = this.metrics.find(key);
      const row = new SummaryRow({ metric });
      for (const prop in AggregateType) {
        const aggregate = prop;
        if (data[key][aggregate]) {
          row.values[aggregate] = data[key][aggregate];
        }
      }
      values[key] = row;
    }
    this.values = values;
    this.time = time;
  }
  annotate(metrics) {
    this.metrics = metrics;
    for (const key in this.values) {
      this.values[key].metric = metrics.find(key);
    }
  }
};

// src/Digest.ts
var Config = class {
  constructor(from = {}) {
    Object.assign(this, from);
  }
};
var Param = class {
  constructor(from = {}) {
    Object.assign(this, from);
  }
};
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2["config"] = "config";
  EventType2["param"] = "param";
  EventType2["start"] = "start";
  EventType2["stop"] = "stop";
  EventType2["metric"] = "metric";
  EventType2["snapshot"] = "snapshot";
  EventType2["cumulative"] = "cumulative";
  return EventType2;
})(EventType || {});
var Digest = class {
  config;
  param;
  start;
  stop;
  metrics;
  samples;
  summary;
  constructor({
    config = {},
    param = {},
    start = void 0,
    stop = void 0,
    metrics = new Metrics(),
    samples = new Samples(),
    summary = new Summary()
  } = {}) {
    this.config = config;
    this.param = param;
    this.start = start;
    this.stop = stop;
    this.metrics = metrics;
    this.samples = samples;
    this.summary = summary;
  }
  handleEvent(event) {
    const type = event.type;
    const data = JSON.parse(event.data);
    this.onEvent(type, data);
  }
  onEvent(type, data) {
    switch (type) {
      case "config" /* config */:
        this.onConfig(data);
        break;
      case "param" /* param */:
        this.onParam(data);
        break;
      case "start" /* start */:
        this.onStart(data);
        break;
      case "stop" /* stop */:
        this.onStop(data);
        break;
      case "metric" /* metric */:
        this.onMetric(data);
        break;
      case "snapshot" /* snapshot */:
        this.onSnapshot(data);
        break;
      case "cumulative" /* cumulative */:
        this.onCumulative(data);
        break;
    }
  }
  onConfig(data) {
    Object.assign(this.config, data);
  }
  onParam(data) {
    Object.assign(this.param, data);
  }
  onStart(data) {
    if (data["time"] && data["time"].value) {
      this.start = new Date(data["time"].value);
    }
  }
  onStop(data) {
    if (data["time"] && data["time"].value) {
      this.start = new Date(data["time"].value);
    }
  }
  onMetric(data) {
    this.metrics.onEvent(data);
    this.samples.annotate(this.metrics);
    this.summary.annotate(this.metrics);
  }
  onSnapshot(data) {
    this.samples.onEvent(data);
    this.samples.annotate(this.metrics);
  }
  onCumulative(data) {
    this.summary.onEvent(data);
    this.summary.annotate(this.metrics);
  }
};
export {
  Config,
  Digest,
  EventType,
  MetricType,
  Metrics,
  Param,
  Query,
  SampleVector,
  Samples,
  SamplesView,
  UnitType,
  ValueType
};
