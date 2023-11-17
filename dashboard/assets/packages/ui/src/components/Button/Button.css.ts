// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"

import { vars } from "theme"

const base = style({
  backgroundColor: "transparent",
  border: "none",
  color: vars.colors.text.primary,
  fontSize: vars.fontSizes.size4,
  fontWeight: vars.fontWeights.weight500,

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

export const variant = styleVariants({
  fill: [
    base,
    {
      backgroundColor: vars.colors.primary.main,
      borderRadius: vars.borderRadius.sm,
      color: vars.colors.common.white,
      fontWeight: vars.fontWeights.weight600,
      letterSpacing: vars.letterSpacings.size4,
      padding: `${vars.sizes.size3} ${vars.sizes.size9}`,
      textTransform: "uppercase",
      selectors: {
        "&:hover:not(:active)": {
          backgroundColor: vars.colors.primary.light
        },
        "&:active": {
          backgroundColor: vars.colors.primary.dark
        }
      }
    }
  ],
  text: [base]
})
