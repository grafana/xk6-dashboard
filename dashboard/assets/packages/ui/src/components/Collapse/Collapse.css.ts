import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const header = style({
  padding: vars.sizes.size5,
  border: `1px solid ${vars.colors.border.primary}`,
  cursor: "pointer"
})

export const content = style({
  padding: vars.sizes.size5,
  border: `1px solid ${vars.colors.border.primary}`,
  borderTop: "none"
})
