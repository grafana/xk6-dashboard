// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Samples } from "@xk6-dashboard/model"
import { Section } from "./Config.ts"

export function isEmptySection(section: Section, samples: Samples): boolean {
  for (let i = 0; i < section.panels.length; i++) {
    for (let j = 0; j < section.panels[i].series.length; j++) {
      const vect = samples.values[section.panels[i].series[j].query]

      if (vect != undefined && !vect.empty) {
        return false
      }
    }
  }

  return true
}
