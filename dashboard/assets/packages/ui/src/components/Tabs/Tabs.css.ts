// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles"

import { vars } from "theme"

const borderSize = 2

export const tabsBase = style({
  background: vars.colors.primary.dark,
  borderBottom: `${borderSize}px solid ${vars.colors.primary.main}`
})

export const tabBase = style({
  padding: `${vars.sizes.size3} ${vars.sizes.size6}`,
  fontSize: vars.fontSizes.size4,
  cursor: "pointer",
  textTransform: "uppercase",
  marginBottom: `-${borderSize}px`
})

const tabsProperties = defineProperties({
  properties: {
    color: {
      active: vars.colors.primary.main,
      inactive: vars.colors.text.disabled
    },
    borderBottom: {
      active: `2px solid ${vars.colors.primary.main}`,
      inactive: "transparent"
    }
  }
})

export const tabVariants = createSprinkles(tabsProperties)
