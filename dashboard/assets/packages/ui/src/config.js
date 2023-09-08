// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { useSSE } from "react-hooks-sse";

function useConfig() {
  return useSSE("config", new Config(), { parser: JSON.parse });
}

class Config {
  constructor() {
    this.tabs = [];
    this.title = "k6 report"
  }
}

export { useConfig };
