// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { globalStyle, style } from "@vanilla-extract/css"
import { vars } from "theme"

export const uplot = style({
  minHeight: "100%"
})

globalStyle(`${uplot} > .u-title`, {
  color: vars.colors.text.primary,
  fontSize: vars.fontSizes.size7,
  fontWeight: `${vars.fontWeights.weight400} !important`,
  whiteSpace: "nowrap"
})

export const container = style({
  padding: vars.sizes.size5,
  height: "100%"
})

export const title = style({
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight500,
  color: vars.colors.text.secondary,
  paddingTop: vars.sizes.size5,
  textAlign: "center"
})
