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
  fontSize: vars.fontSizes.size4,
  fontWeight: vars.fontWeights.weight600
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
  padding: vars.sizes.size3,
  fontSize: vars.fontSizes.size4
})

export const caption = style({
  textAlign: "center",
  color: vars.colors.text.disabled,
  padding: vars.sizes.size1,
  fontSize: vars.fontSizes.size4,
  fontWeight: vars.fontWeights.weight500,
  display: "table-caption",
  captionSide: "top"
})
