import { style } from "@vanilla-extract/css"
import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles"

import { vars } from "theme"

export const root = style({
  display: "flex;"
})

const flexProperties = defineProperties({
  properties: {
    flexDirection: ["row", "column"],
    flexWrap: ["nowrap", "wrap", "wrap-reverse"],
    alignItems: ["flex-start", "flex-end", "stretch", "center", "baseline", "start", "end", "self-start", "self-end"],
    justifyContent: [
      "flex-start",
      "flex-end",
      "start",
      "end",
      "left",
      "right",
      "center",
      "space-between",
      "space-around",
      "space-evenly"
    ],
    gap: {
      1: vars.sizes.size000,
      2: vars.sizes.size2,
      3: vars.sizes.size5,
      4: vars.sizes.size10
    }
  }
})

export const variants = createSprinkles(flexProperties)
