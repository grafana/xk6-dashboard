// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, createThemeContract } from "@vanilla-extract/css"
import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles"

import { vars } from "theme"

const variantProps = defineProperties({
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
      0: 0,
      1: vars.sizes.size1,
      2: vars.sizes.size3,
      3: vars.sizes.size4,
      4: vars.sizes.size9,
      5: vars.sizes.size11
    },
    padding: {
      1: vars.sizes.size3,
      2: vars.sizes.size5,
      3: vars.sizes.size7,
      4: vars.sizes.size10
    }
  }
})

export const theme = createThemeContract({
  flexGrow: null,
  flexShrink: null,
  flexBasis: null,
  height: null,
  width: null
})

export const root = style({
  display: "flex",
  ...theme
})

export const variants = createSprinkles(variantProps)
