// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const uplot = style({
  breakInside: "avoid"
})

export const title = style({
  color: vars.colors.text.secondary,
  fontWeight: vars.fontWeights.weight500
})

export const chart = style({
  marginTop: vars.sizes.size1,
  marginBottom: vars.sizes.size1
})
