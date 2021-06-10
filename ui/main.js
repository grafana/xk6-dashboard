import uPlot from "https://cdn.jsdelivr.net/npm/uplot@1.6.12/dist/uPlot.esm.min.js";
import { SampleSource } from "./index.js";

window.addEventListener("DOMContentLoaded", () => {
  const endpoint = new URLSearchParams(window.location.search).get("endpoint") || "http://127.0.0.1:5665/";
  const src = new SampleSource(`${endpoint}events/sample`);

  src.addEventListener("sample", vus);
  src.addEventListener("sample", duration);
  src.addEventListener("sample", rate);
});

function rate({ target }) {
  const self = rate;

  const data = target.view("http_reqs");

  if (!data) {
    return;
  }

  const rps = [undefined];
  data.series[1].label = "http_reqs_rate";
  for (let i = 1; i < data.http_reqs.length; i++) {
    if (typeof data.http_reqs[i] == "undefined" || typeof data.http_reqs[i - 1] == "undefined") {
      continue;
    }
    rps[i] = Math.abs(data.http_reqs[i] - data.http_reqs[i - 1]) / (data.time[i] - data.time[i - 1]);
  }
  data[1] = rps;

  if (self.chart) {
    self.chart.setData(data);
    return;
  }

  let opts = {
    title: "Request Rate (1/s)",
    class: "card",
    id: self.name,
    width: window.innerWidth - 20,
    height: 240,
    series: data.series,
  };

  self.chart = new uPlot(opts, data, document.querySelector("#charts"));
}

function duration({ target }) {
  const self = duration;

  const data = target.view("http_req_duration_90", "http_req_duration_current");

  if (!data) {
    return;
  }

  if (self.chart) {
    self.chart.setData(data);
    return;
  }

  let opts = {
    title: "Request Duration (ms)",
    class: "card",
    id: self.name,
    width: window.innerWidth - 20,
    height: 240,
    series: data.series,
  };

  self.chart = new uPlot(opts, data, document.querySelector("#charts"));
}

function vus({ target }) {
  const self = vus;

  const data = target.view("vus");

  if (!data) {
    return;
  }

  if (self.chart) {
    self.chart.setData(data);
    return;
  }

  let opts = {
    title: "Virtual Users",
    class: "card",
    id: self.name,
    width: window.innerWidth - 20,
    height: 240,
    series: data.series,
  };

  self.chart = new uPlot(opts, data, document.querySelector("#charts"));
}
