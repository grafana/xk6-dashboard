// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import grpc from "k6/net/grpc";
import { check, sleep } from "k6";
import smurfs from "./smurfs.js";

export let options = {
  scenarios: {
    grpc: {
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
    grpc_req_duration: ["p(90) < 1200", "avg <= 1000"],
  },
};

const client = new grpc.Client();
client.load(null, "hello.proto");

export default async function () {
  client.connect("grpcbin.test.k6.io:9001");

  const response = client.invoke("hello.HelloService/SayHello", {
    greeting: smurfs[0],
  });

  check(response, {
    "status is OK": (r) => r && r.status === grpc.StatusOK,
  });

  const stream = new grpc.Stream(client, "hello.HelloService/BidiHello");

  let count = 0;
  let prom = new Promise((resolve, reject) => {
    stream.on("data", () => {
      if (++count == smurfs.length) {
        stream.end();
        resolve();
      }
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });

  smurfs.forEach((smurf) => {
    sleep(0.2);
    stream.write({ greeting: smurf });
  });

  try {
    await prom;
  } catch (_) {}

  check(count, {
    "smurf greetings OK": (c) => c == smurfs.length,
  });
}
