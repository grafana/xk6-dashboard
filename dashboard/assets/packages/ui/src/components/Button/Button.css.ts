// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const root = style({
  backgroundColor: "transparent",
  border: "1px solid transparent",
  borderRadius: "2px",
  padding: `${vars.sizes.size2} ${vars.sizes.size5}`,
  fontSize: vars.fontSizes.size3,
  fontWeight: vars.fontWeights.weight500,
  letterSpacing: vars.letterSpacings.size4,
  textTransform: "uppercase",
  color: vars.colors.text.secondary,

  selectors: {
    "&:is(:disabled)": {
      opacity: 0.5,
      cursor: "not-allowed"
    },
    "&:not(:disabled)": {
      cursor: "pointer"
    }
  }
})
