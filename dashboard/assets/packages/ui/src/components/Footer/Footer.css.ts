import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const footer = style({
  position: "sticky",
  bottom: 0,
  left: 0,
  padding: `${vars.sizes.size5} ${vars.sizes.size6}`,
  backgroundColor: vars.colors.secondary.dark,
  textAlign: "right"
})
