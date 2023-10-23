// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "theme"

export const button = style({
  padding: `${vars.sizes.size1} ${vars.sizes.size1}`
})

export const icon = styleVariants({
  fill: [],
  text: [{ color: vars.colors.text.primary }]
})
