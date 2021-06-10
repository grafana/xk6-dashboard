import http from "k6/http";
import { sleep } from "k6";

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 2 },
        { duration: "3m", target: 10 },
        { duration: "2m", target: 2 },
        { duration: "3m", target: 10 },
        { duration: "2m", target: 3 },
        { duration: "1m", target: 1 },
      ],
      gracefulRampDown: "0s",
    },
  },
};

export default function () {
  http.get("http://test.k6.io");
  sleep(3);
}
