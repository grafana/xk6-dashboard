/*
 * SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const container = style({
  backgroundColor: vars.colors.background.header
})

export const title = style({
  color: vars.colors.text.secondary,
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight500,
  textAlign: "center",
  flex: 1
})
