// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"
import { sizes } from "theme/sizes.css"

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

export const option = style({
  cursor: "pointer",
  fontSize: vars.sizes.size5
})

export const divider = style({
  "@media": {
    [`(min-width: ${sizes.md})`]: {
      display: "none"
    }
  }
})
