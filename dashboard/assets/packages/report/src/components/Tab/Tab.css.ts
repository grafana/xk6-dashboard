// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const header = style({
  borderLeft: `6px solid ${vars.colors.primary.dark}`,
  paddingLeft: vars.sizes.size5
})

export const title = style({
  lineHeight: vars.lineHeights.size1,
  marginBottom: vars.sizes.size5
})
