// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "theme"

export const popperBase = style({
  backgroundColor: vars.colors.secondary.main,
  border: `1px solid ${vars.colors.primary.main}`,
  padding: 0,
  minWidth: 150,
  overflow: "hidden",
  zIndex: 10
})

export const popper = styleVariants({
  light: [
    popperBase,
    {
      boxShadow: `0 0 8px rgba(0, 0, 0, 0.15)`
    }
  ],
  dark: [
    popperBase,
    {
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.8)"
    }
  ]
})

export const item = style({
  cursor: "pointer",
  fontSize: vars.sizes.size5,
  padding: vars.sizes.size3,
  ":hover": {
    backgroundColor: vars.colors.action.hover
  }
})
