// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import "@xk6-dashboard/model"

import { DigestConfig } from "types/config"

declare module "@xk6-dashboard/model" {
  interface Config extends DigestConfig {}

  interface Digest {
    config?: DigestConfig
  }
}
