// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const container = style({
  overflowX: "auto"
})

export const caption = style({
  textAlign: "center",
  fontWeight: vars.fontWeights.weight500,
  fontSize: vars.fontSizes.size6,
  color: vars.colors.text.primary,
  padding: vars.sizes.size3
})
