// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const header = style({
  padding: vars.sizes.size5,
  border: `1px solid ${vars.colors.divider}`,
  cursor: "pointer"
})

export const content = style({
  padding: vars.sizes.size5,
  border: `1px solid ${vars.colors.divider}`,
  borderTop: "none"
})
