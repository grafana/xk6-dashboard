// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

export default function (config) {
  config.tabs.push({
    title: "Custom",
    id: "custom",
    sections: [],
  });
  return config;
}
