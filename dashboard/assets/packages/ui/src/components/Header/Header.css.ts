// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const container = style({
  backgroundColor: vars.colors.background.header,
  padding: `${vars.sizes.size1} 0`,
  boxShadow: `0 0 6px ${vars.colors.shadow}`,
  position: "relative"
})

export const title = style({
  color: vars.colors.text.secondary,
  fontSize: vars.fontSizes.size6,
  fontWeight: vars.fontWeights.weight300,
  textAlign: "center",
  flex: 1
})
