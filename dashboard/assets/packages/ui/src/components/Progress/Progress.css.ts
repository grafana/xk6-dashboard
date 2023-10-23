// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { keyframes, style, styleVariants } from "@vanilla-extract/css"

import { vars } from "theme"

const backgroundColor = vars.colors.border
const barColor = vars.colors.primary.main

const animateLoadingBar = keyframes({
  from: { backgroundPosition: "200% 0" },
  to: { backgroundPosition: "-200% 0" }
})

export const barBase = style({
  appearance: "none",
  position: "absolute",
  overflow: "hidden",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  zIndex: 0,
  selectors: {
    "&::-webkit-progress-bar": {
      backgroundColor
    },

    "&::-webkit-progress-value": {
      backgroundColor: barColor,
      transition: "1s width"
    },

    "&:indeterminate": {
      animation: `${animateLoadingBar} 1500ms linear infinite`,
      backgroundColor,
      backgroundImage: `linear-gradient(
        to right, 
        ${barColor} 30%, 
        ${backgroundColor} 30%
      )`,
      backgroundPosition: "top left",
      backgroundRepeat: "no-repeat",
      backgroundSize: "150% 150%"
    },
    "&:indeterminate&::-webkit-progress-bar": {
      backgroundColor: "transparent"
    }
  }
})

export const bar = styleVariants({
  loading: [barBase],
  default: [
    barBase,
    {
      selectors: {
        "&:indeterminate": {
          backgroundImage: "none"
        }
      }
    }
  ]
})

export const container = style({
  position: "relative",
  bottom: 0,
  left: 0,
  height: 3,
  width: "100%"
})

export const content = style({
  color: "white",
  position: "relative",
  padding: `calc(${vars.sizes.size5} / 2)`,
  zIndex: 1,
  textAlign: "center",
  fontSize: vars.fontSizes.size4
})
