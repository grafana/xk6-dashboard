import http from "k6/http";
import { sleep } from "k6";

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "10s", target: 2 },
        { duration: "30s", target: 10 },
        { duration: "20s", target: 2 },
        { duration: "30s", target: 10 },
        { duration: "20s", target: 3 },
        { duration: "10s", target: 1 },
      ],
      gracefulRampDown: "0s",
    },
  },
};

export default function () {
  http.get("http://test.k6.io");
  sleep(1);
}
