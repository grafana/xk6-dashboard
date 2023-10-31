// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { createGlobalTheme, createTheme, createThemeContract } from "@vanilla-extract/css"

import { common, grey } from "./colors.css"
import { sizes } from "./sizes.css"
import * as typography from "./typography.css"

const root = createGlobalTheme(":root", {
  sizes,
  ...typography
})

const colorsTheme = createThemeContract({
  common,
  primary: {
    light: null,
    main: null,
    dark: null
  },
  text: {
    primary: null,
    secondary: null,
    disabled: null,
    hover: null
  }
})

export const theme = createTheme(colorsTheme, {
  common,
  primary: {
    light: grey[100],
    main: grey[200],
    dark: grey[300]
  },
  text: {
    primary: grey[900],
    secondary: grey[700],
    disabled: grey[400],
    hover: grey[500]
  }
})

export const vars = { ...root, colors: colorsTheme }
