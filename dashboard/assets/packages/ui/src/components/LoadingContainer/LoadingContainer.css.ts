import { keyframes, style } from "@vanilla-extract/css"
import { vars } from "theme"

const spin = keyframes({
  from: {
    transform: "rotate(0deg)"
  },
  to: {
    transform: "rotate(360deg)"
  }
})

export const icon = style({
  animation: `${spin} 1s linear infinite`,
  color: vars.colors.text.secondary
})
