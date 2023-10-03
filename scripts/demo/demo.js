// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import grpcFn, { options as grpcO } from "./demo-grpc.js";
import wsFn, { options as wsO } from "./demo-ws.js";
import browserFn, { options as browserO } from "./demo-browser.js";
import restFn, { options as restO } from "./demo-rest.js";
import httpFn, { options as httpO } from "./demo-http.js";

export { grpcFn, wsFn, browserFn, restFn, httpFn };

export let options = {
  thresholds: {
    checks: ["rate > 0.8"],
  },
};

function init() {
  const ws = wsO.scenarios.ws;
  const grpc = grpcO.scenarios.grpc;
  const browser = browserO.scenarios.browser;
  const rest = restO.scenarios.rest;
  const http = httpO.scenarios.http;
  ws.exec = "wsFn";
  grpc.exec = "grpcFn";
  browser.exec = "browserFn";
  rest.exec = "restFn";
  http.exec = "httpFn";

  options.scenarios = { ws, grpc, browser, rest, http };

  Object.assign(options.thresholds, wsO.thresholds);
  Object.assign(options.thresholds, grpcO.thresholds);
  Object.assign(options.thresholds, browserO.thresholds);
  Object.assign(options.thresholds, restO.thresholds);
  Object.assign(options.thresholds, httpO.thresholds);
}

init();
