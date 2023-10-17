/*
 * SPDX-FileCopyrightText: 2023 Iván Szkiba
 * SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-License-Identifier: MIT
 */

import { globalStyle, style } from "@vanilla-extract/css"
import { vars } from "theme"

export const uplot = style({
  breakInside: "avoid"
})

globalStyle(`${uplot} > .u-title`, {
  fontSize: vars.fontSizes.size5,
  fontWeight: `${vars.fontWeights.weight400} !important`
})

globalStyle(`${uplot} > .u-label`, {
  fontWeight: `${vars.fontWeights.weight300} !important`
})