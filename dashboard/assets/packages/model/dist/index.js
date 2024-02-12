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
var AggregateType = /* @__PURE__ */ ((AggregateType3) => {
  AggregateType3["value"] = "value";
  AggregateType3["count"] = "count";
  AggregateType3["rate"] = "rate";
  AggregateType3["avg"] = "avg";
  AggregateType3["min"] = "min";
  AggregateType3["max"] = "max";
  AggregateType3["med"] = "med";
  AggregateType3["p90"] = "p90";
  AggregateType3["p95"] = "p95";
  AggregateType3["p99"] = "p99";
  return AggregateType3;
})(AggregateType || {});
var ValueType = /* @__PURE__ */ ((ValueType2) => {
  ValueType2["time"] = "time";
  ValueType2["data"] = "data";
  ValueType2["default"] = "default";
  return ValueType2;
})(ValueType || {});
var MetricType = /* @__PURE__ */ ((MetricType3) => {
  MetricType3["gauge"] = "gauge";
  MetricType3["counter"] = "counter";
  MetricType3["rate"] = "rate";
  MetricType3["trend"] = "trend";
  return MetricType3;
})(MetricType || {});
var Query = class {
  name;
  aggregate;
  constructor(query) {
    const [name, aggregate] = query.split(".", 2);
    this.aggregate = aggregate;
    this.name = name;
  }
};
var propTime = "time";
var Metrics = class {
  values;
  names;
  _aggregates;
  constructor({ values = {}, names = [] } = {}) {
    this.values = values;
    this.names = names;
    this._aggregates = {};
  }
  set aggregates(value) {
    for (const mname in value) {
      const mtype = mname;
      this._aggregates[mtype] = value[mtype].map((atype) => atype.replaceAll("(", "").replaceAll(")", ""));
    }
  }
  onEvent(data) {
    for (const name in data) {
      this.values[name] = { ...data[name], name };
    }
    this.names = Object.keys(this.values);
    this.names.sort();
  }
  toAggregate(data) {
    const out = {};
    for (let i = 0; i < data.length && i < this.names.length; i++) {
      const metric = this.values[this.names[i]];
      if (!metric) {
        continue;
      }
      const agg = {};
      const names = metric.type ? this._aggregates[metric.type] : [];
      for (let j = 0; j < data[i].length && j < names.length; j++) {
        agg[names[j]] = data[i][j];
      }
      out[metric.name] = agg;
    }
    return out;
  }
  find(query) {
    const q = new Query(query);
    return this.values[q.name];
  }
  unit(name, aggregate) {
    const metric = this.find(name);
    if (!metric) {
      return "" /* unknown */;
    }
    if (!aggregate && name != propTime) {
      return "" /* unknown */;
    }
    switch (metric.type) {
      case "counter" /* counter */:
        switch (metric.contains) {
          case "data" /* data */:
            return aggregate == "count" /* count */ ? "bytes" /* bytes */ : "bps" /* bps */;
          default:
            return aggregate == "count" /* count */ ? "counter" /* counter */ : "rps" /* rps */;
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

// src/Event.ts
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2["config"] = "config";
  EventType2["param"] = "param";
  EventType2["start"] = "start";
  EventType2["stop"] = "stop";
  EventType2["metric"] = "metric";
  EventType2["snapshot"] = "snapshot";
  EventType2["cumulative"] = "cumulative";
  EventType2["threshold"] = "threshold";
  return EventType2;
})(EventType || {});

// src/Samples.ts
import jmesspath from "jmespath";
var propTime2 = "time";
var SampleVector = class {
  capacity;
  aggregate;
  metric;
  unit;
  empty;
  name;
  tags;
  group;
  values;
  constructor({
    length = 0,
    capacity = 1e4,
    values = new Array(),
    aggregate = "value" /* value */,
    metric = void 0,
    unit = "" /* unknown */,
    name = "",
    tags = {},
    group = void 0
  } = {}) {
    this.values = length == 0 ? values : new Array(length);
    this.capacity = capacity;
    this.aggregate = aggregate;
    this.metric = metric;
    this.unit = unit;
    this.empty = this.values.length == 0;
    this.name = name;
    this.tags = tags;
    this.group = group;
    Object.defineProperty(this, aggregate, { value: true, configurable: true, enumerable: true, writable: true });
  }
  hasTags() {
    return this.tags != void 0 && Object.keys(this.tags).length != 0;
  }
  formatTags() {
    if (!this.hasTags()) {
      return "";
    }
    let buff = "{";
    for (const name in this.tags) {
      buff += `${name}:${this.tags[name]}`;
    }
    buff += "}";
    return buff;
  }
  get legend() {
    let value = this.aggregate;
    if (this.metric && this.metric.type != "trend" /* trend */) {
      if (this.name.length != 0) {
        value = this.name + this.formatTags();
      }
    }
    return value;
  }
  grow(length) {
    this.values[length - 1] = void 0;
  }
  push(...items) {
    let shifted = false;
    items.forEach((item) => {
      this.values.push(item);
      this.empty = false;
      if (this.values.length == this.capacity) {
        this.values.shift();
        shifted = true;
      }
    });
    if (shifted) {
      this.empty = true;
      for (let i = 0; i < this.values.length; i++) {
        if (this.values[i] != void 0) {
          this.empty = false;
          break;
        }
      }
    }
    return this.values.length;
  }
};
var SamplesView = class extends Array {
  constructor(time) {
    super();
    if (time) {
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
  vectors;
  lookup;
  constructor({ capacity = 1e4, metrics = new Metrics() } = {}) {
    this.capacity = capacity;
    this.metrics = metrics;
    this.lookup = {};
    this.vectors = {};
    this.values = {};
  }
  get length() {
    return this.values[propTime2] ? this.values[propTime2].values.length : 0;
  }
  _push(name, value, aggregate = void 0) {
    const key = aggregate ? name + "." + aggregate : name;
    let vect = this.vectors[key];
    if (!vect) {
      vect = this.newSampleVector(name, aggregate);
      this.vectors[key] = vect;
      this.values[key] = vect;
      let array = this.lookup[vect.name];
      if (!array) {
        array = new Array();
        this.lookup[vect.name] = array;
      }
      array.push(vect);
    } else if (vect.values.length < this.length) {
      vect.grow(this.length);
    }
    vect.push(value);
  }
  newSampleVector(name, aggregate = void 0) {
    const init = {
      length: this.length,
      capacity: this.capacity,
      aggregate
    };
    let sub = "";
    const idx = name.indexOf("{");
    if (idx && idx > 0) {
      sub = name.substring(idx);
      sub = sub.substring(1, sub.length - 1);
      const cidx = sub.indexOf(":");
      const tname = sub.substring(0, cidx);
      const tvalue = sub.substring(cidx + 1);
      init.tags = { [tname]: tvalue };
      if (tname == "group") {
        init.group = tvalue.substring(2);
      }
      name = name.substring(0, idx);
    }
    init.name = name;
    init.metric = this.metrics.find(name);
    init.unit = this.metrics.unit(name, aggregate);
    return new SampleVector(init);
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
      const q = new Query(key);
      this.values[key].unit = metrics.unit(q.name, q.aggregate);
    }
  }
  select(queries) {
    const data = new SamplesView(this.values[propTime2]);
    if (data.length == 0) {
      return data;
    }
    for (const query of queries) {
      const vectors = this.queryAll(query);
      if (vectors.length > 0) {
        data.push(...vectors);
      }
    }
    return data;
  }
  query(expr) {
    const res = jmesspath.search(this.lookup, expr);
    if (Array.isArray(res)) {
      const array = res;
      const first = array.at(0);
      return first instanceof SampleVector ? first : void 0;
    }
    return res instanceof SampleVector ? res : void 0;
  }
  queryAll(expr) {
    const res = jmesspath.search(this.lookup, expr);
    if (!Array.isArray(res) || res.length == 0) {
      return new Array();
    }
    const array = res;
    if (array.at(0) instanceof SampleVector) {
      return array;
    }
    return new Array();
  }
};

// src/Summary.ts
import jmesspath2 from "jmespath";
var SummaryRow = class {
  values;
  metric;
  name;
  tags;
  group;
  constructor({ values, metric, name } = {}) {
    this.values = values;
    this.metric = metric;
    this.name = name;
    if (metric && metric.type) {
      Object.defineProperty(this, metric.type, { value: true, configurable: true, enumerable: true, writable: true });
    }
    let sub = "";
    const idx = name.indexOf("{");
    if (idx && idx > 0) {
      sub = name.substring(idx);
      sub = sub.substring(1, sub.length - 1);
      const cidx = sub.indexOf(":");
      const tname = sub.substring(0, cidx);
      const tvalue = sub.substring(cidx + 1);
      this.tags = { [tname]: tvalue };
      if (tname == "group") {
        this.group = tvalue.substring(2);
      }
      name = name.substring(0, idx);
    }
  }
};
var propTime3 = "time";
var SummaryView = class extends Array {
  aggregates;
  constructor(values) {
    super();
    this.aggregates = new Array();
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      super.push(row);
      if (i == 0) {
        this.aggregates = Object.keys(row.values).sort().map((e) => e);
      }
    }
  }
  get empty() {
    return this.length == 0;
  }
};
var Summary = class {
  values;
  lookup;
  metrics;
  time;
  constructor({ values = {}, metrics = new Metrics(), time = 0 } = {}) {
    this.values = values;
    this.lookup = new Array();
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
      const row = this.newSummaryRow(key, data[key]);
      values[key] = row;
    }
    this.values = values;
    this.time = time;
    const lookup = Array();
    for (const name in this.values) {
      lookup.push(this.values[name]);
    }
    this.lookup = lookup;
  }
  newSummaryRow(name, aggregate) {
    const init = {};
    init.name = name;
    init.metric = this.metrics.find(name);
    init.values = aggregate;
    return new SummaryRow(init);
  }
  annotate(metrics) {
    this.metrics = metrics;
    for (const key in this.values) {
      this.values[key].metric = metrics.find(key);
    }
  }
  select(queries) {
    const all = new Array();
    for (const query of queries) {
      const rows = this.queryAll(query);
      if (rows.length > 0) {
        all.push(...rows);
      }
    }
    return new SummaryView(all);
  }
  queryAll(expr) {
    const res = jmesspath2.search(this.lookup, expr);
    if (!Array.isArray(res) || res.length == 0) {
      return new Array();
    }
    const array = res;
    if (array.at(0) instanceof SummaryRow) {
      return array;
    }
    return new Array();
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
var Thresholds = class {
  constructor(from = {}) {
    Object.assign(this, from);
  }
};
var Digest = class {
  config;
  param;
  start;
  stop;
  metrics;
  samples;
  summary;
  thresholds;
  constructor({
    config = {},
    param = {},
    start = void 0,
    stop = void 0,
    metrics = new Metrics(),
    samples = new Samples(),
    summary = new Summary(),
    thresholds = new Thresholds()
  } = {}) {
    this.config = config;
    this.param = param;
    this.start = start;
    this.stop = stop;
    this.metrics = metrics;
    this.samples = samples;
    this.summary = summary;
    this.thresholds = thresholds;
  }
  handleEvent(event) {
    const type = event.type;
    const data = JSON.parse(event.data);
    this.onEvent({ type, data });
  }
  onEvent(event) {
    switch (event.type) {
      case "config" /* config */:
        this.onConfig(event.data);
        break;
      case "param" /* param */:
        this.onParam(event.data);
        break;
      case "start" /* start */:
        this.onStart(this.metrics.toAggregate(event.data));
        break;
      case "stop" /* stop */:
        this.onStop(this.metrics.toAggregate(event.data));
        break;
      case "metric" /* metric */:
        this.onMetric(event.data);
        break;
      case "snapshot" /* snapshot */:
        this.onSnapshot(this.metrics.toAggregate(event.data));
        break;
      case "cumulative" /* cumulative */:
        this.onCumulative(this.metrics.toAggregate(event.data));
        break;
      case "threshold" /* threshold */:
        this.onThreshold(event.data);
        break;
    }
  }
  onConfig(data) {
    Object.assign(this.config, data);
  }
  onParam(data) {
    Object.assign(this.param, data);
    this.metrics.aggregates = data["aggregates"];
  }
  onStart(data) {
    if (data["time"] && data["time"].value) {
      this.start = new Date(data["time"].value);
    }
  }
  onStop(data) {
    if (data["time"] && data["time"].value) {
      this.stop = new Date(data["time"].value);
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
  onThreshold(data) {
    Object.assign(this.thresholds, data);
  }
};
export {
  AggregateType,
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
  Summary,
  SummaryRow,
  SummaryView,
  UnitType,
  ValueType
};
