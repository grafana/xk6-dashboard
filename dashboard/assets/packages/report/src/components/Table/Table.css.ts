// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"

import { vars } from "theme"

export const table = style({
  borderCollapse: "collapse",
  width: "100%"
})

export const th = style({
  padding: vars.sizes.size3,
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight600
})

export const tr = styleVariants({
  thead: [],
  tbody: [
    {
      ":hover": {
        backgroundColor: vars.colors.primary.main
      }
    },
    {
      selectors: {
        "&:nth-child(odd):not(:hover)": {
          backgroundColor: vars.colors.primary.light
        },
        "&:nth-child(even):not(:hover)": {
          backgroundColor: vars.colors.common.white
        }
      }
    }
  ]
})

export const td = style({
  padding: vars.sizes.size3,
  fontSize: vars.fontSizes.size4
})
