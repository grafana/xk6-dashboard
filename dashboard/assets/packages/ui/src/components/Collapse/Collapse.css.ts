// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles"

import { vars } from "theme"

const borderProps = defineProperties({
  properties: {
    borderRadius: {
      true: `${vars.borderRadius.medium} ${vars.borderRadius.medium} 0 0`,
      false: vars.borderRadius.medium
    }
  }
})

export const header = style({
  color: vars.colors.text.secondary,
  padding: vars.sizes.size6,
  backgroundColor: vars.colors.secondary.light,
  cursor: "pointer"
})

export const title = style({
  fontSize: vars.fontSizes.size6,
  fontWeight: vars.fontWeights.weight500
})

export const content = style({
  padding: vars.sizes.size6,
  backgroundColor: vars.colors.secondary.main
})

export const border = createSprinkles(borderProps)
