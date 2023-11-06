// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles"

import { vars } from "theme"
import { sizes } from "theme/sizes.css"

export const nav = style({
  background: vars.colors.secondary.main,
  overflow: "auto",
  padding: `0 ${vars.sizes.size7}`
})

const listProps = defineProperties({
  conditions: {
    mobile: {},
    desktop: { "@media": `(min-width: ${sizes.md})` }
  },
  defaultCondition: "mobile",
  properties: {
    display: ["none", "flex"]
  }
})

export const listVariant = createSprinkles(listProps)

const itemBase = style({
  padding: `${vars.sizes.size3} ${vars.sizes.size7}`,
  fontSize: vars.fontSizes.size5,
  fontWeight: vars.fontWeights.weight500,
  position: "relative",
  cursor: "pointer",
  zIndex: 1,
  ":before": {
    content: '""',
    position: "absolute",
    left: "0",
    top: "0",
    bottom: 0,
    margin: "auto",
    width: "100%",
    height: "80%",
    borderRadius: vars.borderRadius.medium,
    zIndex: -1
  }
})

export const item = styleVariants({
  active: [
    itemBase,
    {
      color: vars.colors.text.primary,
      ":before": {
        background: vars.colors.action.hover
      }
    }
  ],
  inactive: [
    itemBase,
    {
      color: vars.colors.text.secondary,
      selectors: {
        "&:hover:before": {
          color: vars.colors.text.primary,
          background: vars.colors.action.hover,
          opacity: 0.7
        }
      }
    }
  ]
})
