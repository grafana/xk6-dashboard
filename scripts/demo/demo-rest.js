// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = {
  scenarios: {
    rest: {
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
    http_req_duration: ["p(90) < 400"],
  },
};

export function setup() {} // to have "setup" group, which only has metric value at the begining of the test run

export default function () {
  let crocodiles, ok;

  group("list crocodiles", () => {
    const response = http.get("https://test-api.k6.io/public/crocodiles/");

    ok = check(response, {
      "status is OK": (r) => r && r.status === 200,
    });

    if (ok) {
      crocodiles = response.json();
    }
  });

  if (!ok) {
    return;
  }

  group("get crocodile", () => {
    for (var i = 0; i < crocodiles.length; i++) {
      let response = http.get(http.url`https://test-api.k6.io/public/crocodiles/${crocodiles[i].id}`);

      check(response, {
        "status is OK": (r) => r && r.status == 200,
      });

      sleep(0.2);
    }
  });
}
