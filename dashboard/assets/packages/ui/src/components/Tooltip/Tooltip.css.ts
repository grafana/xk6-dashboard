// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "theme"

export const popperBase = style({
  border: `1px solid ${vars.colors.primary.main}`,
  borderRadius: 0,
  padding: vars.sizes.size2,
  zIndex: 10
})

export const popper = styleVariants({
  light: [
    popperBase,
    {
      backgroundColor: vars.colors.secondary.light
    }
  ],
  dark: [
    popperBase,
    {
      backgroundColor: vars.colors.secondary.dark
    }
  ]
})
