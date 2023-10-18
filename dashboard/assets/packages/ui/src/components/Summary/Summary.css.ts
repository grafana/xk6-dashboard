// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"

import { vars } from "theme"

export const summary = style({
  paddingTop: vars.sizes.size3,
  overflowX: "auto",
  backgroundColor: vars.colors.component.table.main
})

export const table = style({
  borderCollapse: "collapse",
  width: "100%"
})

export const th = style({
  padding: vars.sizes.size3,
  fontWeight: vars.fontWeights.weight700
})

const trBase = style({
  borderBottom: `1px solid ${vars.colors.component.table.border}`
})

export const tr = styleVariants({
  thead: [trBase],
  tbody: [
    trBase,
    {
      ":last-child": {
        borderBottom: "none"
      },
      ":hover": {
        backgroundColor: vars.colors.component.table.hover
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
