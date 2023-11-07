// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"
import { vars } from "theme"

export const heading = style({
  fontSize: vars.fontSizes.sizeFluid
})

export const date = style({
  color: vars.colors.text.secondary
})
