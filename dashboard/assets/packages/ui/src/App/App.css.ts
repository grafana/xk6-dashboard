// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { vars } from "theme"

export const container = style({
  backgroundColor: vars.colors.secondary.dark,
  color: vars.colors.text.primary,
  minHeight: "100vh"
})

export const main = style({
  padding: vars.sizes.size6
})
