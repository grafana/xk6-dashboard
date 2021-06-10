import uPlot from "https://cdn.jsdelivr.net/npm/uplot@1.6.12/dist/uPlot.esm.min.js";

if (document) {
  document
    .getElementsByTagName("head")[0]
    .insertAdjacentHTML(
      "beforeend",
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.12/dist/uPlot.min.css" />'
    );
}

export const palette = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"];

export class SampleSource extends EventSource {
  constructor(url, capacity = 1000) {
    super(url);
    this.capacity = capacity;
    this.length = 0;
    this.time = [];
    this.sample = {};
    this.metrics = {};
    this.addEventListener("message", (e) => this._onmessage(e));

    // wait until all metrics metadata available
    const api = url.replace("events/sample", "api/metrics");
    this._peding = () => {
      fetch(api)
        .then((r) => r.json())
        .then((v) => {
          if (v.http_reqs) {
            for (var key in v) {
              const k = key + "_rate";
              if (v[key].type == "counter" && !this.sample[k]) {
                this.sample[k] = new Array(this.length);
              }
            }
            delete this._peding;
          }
        });
    };
  }

  view(...keys) {
    if (Object.keys(this.sample).filter((k) => keys.includes(k)).length != keys.length) {
      return undefined;
    }

    const all = [this.time];
    const series = [{ label: "time" }];
    Object.defineProperty(all, "time", { value: all[0] });
    Object.defineProperty(all, "series", { value: series });

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      all.push(this.sample[key]);
      Object.defineProperty(all, key, { value: this.sample[key] });
      series.push({
        label: key,
        fill: palette[i] + "20",
        stroke: palette[i],
      });
    }

    return all;
  }

  _onmessage(event) {
    // check pending metrics metadata
    if (this._peding) {
      this._peding();
    }

    const data = JSON.parse(event.data);
    const now = Math.floor(Date.now() / 1000);

    for (const key of Object.keys(data)) {
      if (!this.sample[key]) {
        this.sample[key] = new Array(this.length);
      }

      const r = key + "_rate";
      if (this.sample[r]) {
        const last = this.length - 1;
        this.sample[r].push(Math.abs(this.sample[key][last] - data[key]) / (now - this.time[last]));
      }

      this.sample[key].push(data[key]);
    }

    this.time.push(now);

    this.length++;
    if (this.length > this.capacity) {
      this.time.shift();
      for (const key of Object.keys(this.sample)) {
        this.sample[key].shift();
        const r = key + "_rate";
        if (this.sample[r]) {
          this.sample[r].shift();
        }
      }
      this.length--;
    }

    this.dispatchEvent(new Event("sample"));
  }
}

export class SimpleChart {
  constructor(src, { title, dst = "#charts" }, ...keys) {
    this.dst = dst;
    this.title = title;
    this.src = src;
    this.keys = keys;
    src.addEventListener("sample", (e) => this.listener(e));
  }

  listener({ target }) {
    const data = target.view(...this.keys);

    if (!data) {
      return;
    }

    if (this.chart) {
      this.chart.setData(data);
      return;
    }

    let opts = {
      title: this.title,
      class: "card",
      width: window.innerWidth - 20,
      height: 240,
      series: data.series,
    };

    this.chart = new uPlot(opts, data, document.querySelector(this.dst));
  }
}
