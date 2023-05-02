import http from "k6/http";

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: "constant-vus",
      vus: 2,
      duration: '2s',
    },
  },
};

export default function () {
  http.get("http://test.k6.io");
}
