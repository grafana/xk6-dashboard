// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { WebSocket } from "k6/experimental/websockets";
import { check, sleep } from "k6";
import smurfs from "./smurfs.js";

export let options = {
  scenarios: {
    ws: {
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
    ws_ping: ["p(90) < 1000", "avg < 500"],
  },
};

export default async function () {
  const ws = new WebSocket("wss://test-api.k6.io/ws/crocochat/dashboard/");

  let count = 0;
  let prom = new Promise((resolve, reject) => {
    ws.onmessage = (msg) => {
      ws.ping();
      let data = JSON.parse(msg.data);
      if (data.event == "CHAT_MSG") {
        if (++count == smurfs.length) {
          ws.close();
          resolve();
        }
      }
    };

    ws.onerror = (err) => {
      reject(err);
    };
  });

  ws.onopen = () => {
    ws.ping();
    smurfs.forEach((smurf) => {
      sleep(0.2);
      ws.send(`{"event":"SAY","message":"Hello ${smurf}"}`);
    });
  };

  try {
    await prom;
  } catch (_) {}

  check(count, {
    "smurf greetings OK": (c) => c == smurfs.length,
  });
}
