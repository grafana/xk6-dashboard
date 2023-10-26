// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { vars } from "theme"

export const icon = style({
  animation: `${vars.animation.spin} 1s linear infinite`,
  color: vars.colors.text.secondary
})
