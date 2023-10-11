// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Section } from "@xk6-dashboard/view"

export interface Tab {
  title?: string
  id?: string
  summary?: string
  report?: boolean
  sections: Section[]
}

export interface UIConfig {
  title: string
  tabs: Tab[]
}
