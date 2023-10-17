// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { vars } from "theme"

export const container = style({
  backgroundColor: vars.colors.background.primary,
  height: "100%",
  color: vars.colors.text.primary
})

export const header = style({
  position: "sticky",
  top: 0,
  zIndex: 1
})

export const main = style({
  padding: vars.sizes.size5
})