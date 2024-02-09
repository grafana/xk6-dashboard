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

const baseButton = style([
  base,
  {
    borderRadius: vars.borderRadius.sm,
    fontWeight: vars.fontWeights.weight600,
    letterSpacing: vars.letterSpacings.size4,
    padding: `${vars.sizes.size3} ${vars.sizes.size8}`,
    textTransform: "uppercase"
  }
])

export const variant = styleVariants({
  fill: [
    baseButton,
    {
      backgroundColor: vars.colors.primary.main,
      color: vars.colors.common.white,
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
  outline: [
    baseButton,
    {
      outline: `2px solid ${vars.colors.components.button.outline.border}`,
      outlineOffset: "-2px",
      color: vars.colors.components.button.outline.text,
      selectors: {
        "&:hover": {
          backgroundColor: vars.colors.components.button.outline.background
        }
      }
    }
  ],
  text: [base]
})
