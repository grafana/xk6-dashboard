// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import http from "k6/http";
import { check, sleep, group } from "k6";
import smurfs from "./smurfs.js";

export let options = {
  scenarios: {
    http: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "30s", target: 2 },
        { duration: "3m", target: 5 },
        { duration: "2m", target: 2 },
        { duration: "3m", target: 5 },
        { duration: "2m", target: 3 },
        { duration: "1m", target: 1 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95) < 400", "p(90) < 500", "avg < 200"],
  },
};

export default function () {
  const base = "https://httpbin.test.k6.io/";

  let response = http.get(`${base}status/200,200,200,404`);

  check(response, {
    "status is OK": (r) => r && r.status === 200,
  });

  smurfs.forEach((smurf) => {
    response = http.post(`${base}/post`, JSON.stringify({ smurf }), {
      headers: { "Content-Type": "application/json" },
    });

    check(response, {
      "status is OK": (r) => r && r.status === 200,
    });

    sleep(0.2);
  });
}
