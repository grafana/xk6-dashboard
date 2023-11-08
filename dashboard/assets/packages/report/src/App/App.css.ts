// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"
import { sizes } from "theme/sizes.css"

export const main = style({
  padding: vars.sizes.size5,
  "@media": {
    [`(min-width: ${sizes.lg})`]: {
      padding: vars.sizes.size11
    }
  }
})

export const usage = style({
  color: vars.colors.text.secondary,
  fontStyle: "italic"
})
