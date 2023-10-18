// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { globalStyle, style } from "@vanilla-extract/css"
import { vars } from "theme"

export const uplot = style({})

globalStyle(`${uplot} > .u-title`, {
  fontSize: vars.fontSizes.size5,
  fontWeight: `${vars.fontWeights.weight500} !important`,
  whiteSpace: "nowrap"
})

export const container = style({
  paddingTop: vars.sizes.size5
})

export const title = style({
  fontSize: vars.fontSizes.size1,
  color: vars.colors.text.primary,
  marginBottom: vars.sizes.size2,
  textAlign: "center"
})
