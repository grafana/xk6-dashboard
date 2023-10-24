import { style } from "@vanilla-extract/css"
import { vars } from "theme"

export const icon = style({
  animation: `${vars.animation.spin} 1s linear infinite`,
  color: vars.colors.text.secondary
})
