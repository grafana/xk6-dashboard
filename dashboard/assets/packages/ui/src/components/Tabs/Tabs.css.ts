import { style } from "@vanilla-extract/css"
import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles"

import { vars } from "theme"

const borderSize = 2

export const tabsBase = style({
  background: vars.colors.background.default,
  borderBottom: `${borderSize}px solid ${vars.colors.divider}`
})

export const tabBase = style({
  padding: `${vars.sizes.size3} ${vars.sizes.size5}`,
  cursor: "pointer",
  textTransform: "uppercase",
  marginBottom: `-${borderSize}px`
})

const tabsProperties = defineProperties({
  properties: {
    color: {
      active: vars.colors.primary.main,
      inactive: vars.colors.text.primary
    },
    borderBottom: {
      active: `2px solid ${vars.colors.primary.main}`,
      inactive: "transparent"
    }
  }
})

export const tabVariants = createSprinkles(tabsProperties)
