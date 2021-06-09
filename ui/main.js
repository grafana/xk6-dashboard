window.addEventListener("DOMContentLoaded", onInit);

class SampleSource {
  constructor(location = "/api/events", maxSampleNum = 1000) {
    this.time = [];
    this.sample = {};
    this.maxSampleNum = maxSampleNum;
    this.eventSource = new EventSource(location);
    this.eventSource.onmessage = (event) => this.update(JSON.parse(event.data));
  }

  update(data) {
    const now = Math.floor(Date.now() / 1000);

    for (const key of Object.keys(data)) {
      if (!this.sample[key]) {
        this.sample[key] = new Array(this.time.length);
      }
      this.sample[key].push(data[key]);
    }

    this.time.push(now);

    if (this.time.length > this.maxSampleNum) {
      this.time.shift();
      for (const key of Object.keys(this.sample)) {
        this.sample[key].shift();
      }
    }

    window.dispatchEvent(new CustomEvent("sample", { detail: this }));
  }
}

function onInit() {
  M.AutoInit();
  const endpoint = new URLSearchParams(window.location.search).get("endpoint") || "http://127.0.0.1:5665/";

  const sampleSource = new SampleSource(`${endpoint}events/sample`);
  window.addEventListener("sample", vus);
  window.addEventListener("sample", durations);
}

const chart = {};

function durations({ detail: { time, sample } }) {
  const vars = ["http_req_duration_90", "http_req_duration_current"];
  if (!sample[vars[0]] || !sample[vars[1]]) {
    return;
  }
  const data = [time, sample[vars[0]], sample[vars[1]]];
  if (chart.durations) {
    chart.durations.setData(data);
    return;
  }

  let opts = {
    title: "Request Durations",
    id: "duration",
    width: window.innerWidth - 40,
    height: 320,
    series: [
      {},
      { label: vars[0], stroke: "green", width: 1, fill: "rgba(0, 255, 0, 0.1)" },
      { label: vars[1], stroke: "red", width: 1, fill: "rgba(255, 0, 0, 0.1)" },
    ],
  };

  chart.durations = new uPlot(opts, data, document.querySelector("#durations"));
}

function vus({ detail: { time, sample } }) {
  const vars = ["vus", "vus_max"];
  const data = [time, sample[vars[0]], sample[vars[1]]];
  if (chart.vus) {
    chart.vus.setData(data);
    return;
  }

  let opts = {
    title: "Virtual Users",
    id: "vus",
    width: window.innerWidth - 40,
    height: 320,
    series: [
      {},
      { label: vars[0], stroke: "blue", width: 1, fill: "rgba(0, 0, 255, 0.1)" },
      { label: vars[1], show: false, stroke: "green", width: 1 },
    ],
  };

  chart.vus = new uPlot(opts, data, document.querySelector("#vus"));
}
