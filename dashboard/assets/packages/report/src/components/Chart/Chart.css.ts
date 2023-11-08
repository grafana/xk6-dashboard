// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const chartWrapper = style({
  position: "relative"
})

export const noData = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight500,
  padding: `${vars.sizes.size2} ${vars.sizes.size8}`,
  border: `1px dashed ${vars.colors.primary.dark}`
})

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
