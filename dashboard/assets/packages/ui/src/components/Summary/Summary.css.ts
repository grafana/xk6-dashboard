/*
 * SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { style, styleVariants } from "@vanilla-extract/css"

import { vars } from "theme"

export const summaryBase = style({
  paddingTop: vars.sizes.size3
})

export const summary = styleVariants({
  light: [
    summaryBase,
    {
      backgroundColor: "#f6f6f6c0"
    }
  ],
  dark: [
    summaryBase,
    {
      backgroundColor: "#202020c0"
    }
  ]
})

export const table = style({
  borderCollapse: "collapse",
  width: "100%"
})

export const th = style({
  padding: vars.sizes.size3,
  fontWeight: vars.fontWeights.weight900
})

const trBase = style({
  borderBottom: `1px solid ${vars.colors.border.primary}`
})

export const tr = styleVariants({
  thead: [trBase],
  tbody: [
    trBase,
    {
      ":last-child": {
        borderBottom: "none"
      }
    }
  ]
})

export const td = style({
  padding: vars.sizes.size3
})

export const caption = style({
  textAlign: "center",
  padding: vars.sizes.size1,
  fontWeight: 700,
  display: "table-caption",
  captionSide: "top"
})
