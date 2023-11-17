// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const header = style({
  backgroundColor: vars.colors.secondary.main,
  boxShadow: `0 0 10px ${vars.colors.shadow}`,
  position: "sticky",
  top: 0,
  zIndex: 1
})

export const content = style({
  padding: `${vars.sizes.size3} ${vars.sizes.size6}`
})

export const options = style({
  padding: 0
})

export const divider = style({
  "@media": {
    [`(min-width: ${vars.breakpoints.header})`]: {
      display: "none"
    }
  }
})

export const stats = style({
  border: `2px solid ${vars.colors.border}`,
  padding: `${vars.sizes.size3} ${vars.sizes.size5}`,
  borderRadius: vars.borderRadius.md
})
