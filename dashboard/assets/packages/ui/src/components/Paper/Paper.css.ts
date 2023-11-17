// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { style } from "@vanilla-extract/css"

import { vars } from "theme"

export const styles = style({
  backgroundColor: vars.colors.secondary.main,
  borderRadius: vars.borderRadius.md,
  padding: vars.sizes.size8
})
