// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, createContainer } from "@vanilla-extract/css"
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles"

import { vars } from "theme"
import { sizes } from "theme/sizes.css"

const columnArray = Array.from({ length: 12 }, (_, i) => i + 1)
const containerName = createContainer()

export const containerBase = style({
  containerName,
  containerType: "inline-size",
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
    xs: { "@container": `${containerName} (min-width: ${sizes.xs})` },
    sm: { "@container": `${containerName} (min-width: ${sizes.sm})` },
    md: { "@container": `${containerName} (min-width: ${sizes.md})` },
    lg: { "@container": `${containerName} (min-width: ${sizes.lg})` },
    xl: { "@container": `${containerName} (min-width: ${sizes.xl})` },
    xxl: { "@container": `${containerName} (min-width: ${sizes.xxl})` }
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
