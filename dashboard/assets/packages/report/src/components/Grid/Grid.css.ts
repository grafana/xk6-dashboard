// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles"

import { vars } from "theme"
import { sizes } from "theme/sizes.css"

const columnArray = Array.from({ length: 12 }, (_, i) => i + 1)

export const containerBase = style({
  display: "grid",
  gridTemplateRows: "auto",
  gridTemplateColumns: "repeat(12, 1fr)"
})

const containerProperties = defineProperties({
  properties: {
    gap: {
      1: vars.sizes.size1,
      2: `clamp(${vars.sizes.size1}, 4vw, ${vars.sizes.size2})`,
      3: `clamp(${vars.sizes.size1}, 4vw, ${vars.sizes.size6})`,
      4: `clamp(${vars.sizes.size1}, 4vw, ${vars.sizes.size11})`
    }
  }
})

const columnProperties = defineProperties({
  conditions: {
    xs: { "@media": `(min-width: ${sizes.xs})` },
    sm: { "@media": `(min-width: ${sizes.sm})` },
    md: { "@media": `(min-width: ${sizes.md})` },
    lg: { "@media": `(min-width: ${sizes.lg})` },
    xl: { "@media": `(min-width: ${sizes.xl})` },
    xxl: { "@media": `(min-width: ${sizes.xxl})` }
  },
  defaultCondition: "xs",
  properties: {
    gridColumn: columnArray.reduce(
      (obj, i) => ({
        ...obj,
        [i]: `span ${i}`
      }),
      {}
    )
  }
})

export const column = createSprinkles(columnProperties)

export const container = {
  root: containerBase,
  variants: createSprinkles(containerProperties)
}
