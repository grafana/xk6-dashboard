// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Param } from "@xk6-dashboard/model"

import type { UIConfig } from "types/config"

declare module "@xk6-dashboard/model" {
  interface Config extends UIConfig {}

  interface Digest {
    config?: UIConfig
    param: Param & { period: number }
  }
}
