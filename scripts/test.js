// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import http from "k6/http";

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: "constant-vus",
      vus: 2,
      duration: "20s",
    },
  },
};

export default function () {
  http.get("http://test.k6.io");
}
