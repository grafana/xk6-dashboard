export const palette = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"];

export class SampleSource extends EventSource {
  constructor(url, capacity = 1000) {
    super(url);
    this.capacity = capacity;
    this.length = 0;
    this.time = [];
    this.sample = {};
    this.addEventListener("message", (e) => this._onmessage(e));
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
    const data = JSON.parse(event.data);
    const now = Math.floor(Date.now() / 1000);

    for (const key of Object.keys(data)) {
      if (!this.sample[key]) {
        this.sample[key] = new Array(this.length);
      }
      this.sample[key].push(data[key]);
    }

    this.time.push(now);

    this.length++;
    if (this.length > this.capacity) {
      this.time.shift();
      for (const key of Object.keys(this.sample)) {
        this.sample[key].shift();
      }
      this.length--;
    }

    this.dispatchEvent(new Event("sample"));
  }
}
