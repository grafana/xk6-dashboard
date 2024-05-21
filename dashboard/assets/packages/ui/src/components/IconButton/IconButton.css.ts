// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "theme"

export const button = style({
  padding: `${vars.sizes.size1} ${vars.sizes.size1}`,
  position: "relative",
  ":before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "100%",
    transform: "scale(0)",
    transition: "transform 0.2s ease-in-out",
    zIndex: -1
  },
  selectors: {
    "&:hover:before": {
      backgroundColor: vars.colors.action.hover,
      transform: "scale(1)"
    },
    "&:active:before": {
      backgroundColor: vars.colors.action.active
    }
  }
})

export const icon = styleVariants({
  fill: [],
  outline: [],
  text: [{ color: vars.colors.text.primary }]
})
