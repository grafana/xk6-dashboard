// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "theme"

const popperBase = style({
  border: `1px solid ${vars.colors.primary.main}`,
  borderRadius: 0,
  fontSize: vars.fontSizes.size4,
  maxWidth: "600px",
  padding: vars.sizes.size4,
  zIndex: 10
})

export const popper = styleVariants({
  light: [
    popperBase,
    {
      backgroundColor: vars.colors.secondary.light
    }
  ],
  dark: [
    popperBase,
    {
      backgroundColor: vars.colors.secondary.dark
    }
  ]
})

const arrowSize = 8

export const arrowBase = style({
  position: "absolute",
  width: `${arrowSize}px`,
  height: `${arrowSize}px`,
  background: "inherit",
  visibility: "hidden",
  ":before": {
    position: "absolute",
    border: `1px solid transparent`,
    width: `${arrowSize}px`,
    height: `${arrowSize}px`,
    background: "inherit",
    content: '""',
    visibility: "visible",
    transform: "rotate(45deg)"
  }
})

export const arrow = styleVariants({
  top: [
    arrowBase,
    {
      bottom: `-${arrowSize / 2}px`,
      ":before": {
        borderBottomColor: vars.colors.primary.main,
        borderRightColor: vars.colors.primary.main
      }
    }
  ],
  bottom: [
    arrowBase,
    {
      top: `-${arrowSize / 2}px`,
      ":before": {
        borderTopColor: vars.colors.primary.main,
        borderLeftColor: vars.colors.primary.main
      }
    }
  ],
  left: [
    arrowBase,
    {
      right: `-${arrowSize / 2}px`,
      ":before": {
        borderTopColor: vars.colors.primary.main,
        borderRightColor: vars.colors.primary.main
      }
    }
  ],
  right: [
    arrowBase,
    {
      left: `-${arrowSize / 2}px`,
      ":before": {
        borderBottomColor: vars.colors.primary.main,
        borderLeftColor: vars.colors.primary.main
      }
    }
  ]
})
