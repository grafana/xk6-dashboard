// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles"

import { vars } from "theme"
import { sizes } from "theme/sizes.css"

export const nav = style({
  background: vars.colors.secondary.main,
  overflow: "auto"
})

const navProps = defineProperties({
  conditions: {
    mobile: {},
    desktop: { "@media": `(min-width: ${sizes.md})` }
  },
  defaultCondition: "mobile",
  properties: {
    display: ["none", "flex"]
  }
})

export const navVariant = createSprinkles(navProps)

const itemBase = style({
  padding: `${vars.sizes.size3} ${vars.sizes.size6}`,
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight500,
  cursor: "pointer"
})

export const item = styleVariants({
  active: [
    itemBase,
    {
      color: vars.colors.text.primary
    }
  ],
  inactive: [
    itemBase,
    {
      color: vars.colors.text.secondary,
      selectors: {
        "&:hover:not(:active)": {
          color: vars.colors.text.hover
        }
      }
    }
  ]
})
