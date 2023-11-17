// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { vars } from "theme"

export const container = style({
  padding: 0
})

export const title = style({
  backgroundColor: vars.colors.secondary.light,
  borderRadius: `${vars.borderRadius.md} ${vars.borderRadius.md} 0 0`,
  color: vars.colors.text.secondary,
  padding: `${vars.sizes.size6} ${vars.sizes.size8}`,
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight500
})

export const content = style({
  padding: vars.sizes.size5
})
