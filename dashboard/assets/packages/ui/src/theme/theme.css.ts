// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { createGlobalTheme, createTheme, createThemeContract } from "@vanilla-extract/css"

import { brand, common, grey } from "./colors.css"
import { sizes } from "./sizes.css"
import * as typography from "./typography.css"

const root = createGlobalTheme("#root", {
  sizes,
  ...typography
})

const colorsTheme = createThemeContract({
  component: {
    tab: {
      main: null
    },
    table: {
      main: null,
      hover: null,
      border: null
    }
  },
  primary: {
    light: null,
    main: null,
    dark: null
  },
  secondary: {
    light: null,
    main: null,
    dark: null
  },
  text: {
    primary: null,
    secondary: null,
    disabled: null
  },
  background: {
    default: null,
    header: null
  },
  divider: null,
  shadow: null
})

export const lightTheme = createTheme(colorsTheme, {
  component: {
    tab: {
      main: grey[600]
    },
    table: {
      main: grey[100],
      hover: grey[200],
      border: grey[300]
    }
  },
  primary: {
    light: brand.violet,
    main: brand.violet,
    dark: brand.violet
  },
  secondary: {
    light: grey[400],
    main: grey[600],
    dark: grey[800]
  },
  text: {
    primary: common.black,
    secondary: common.white,
    disabled: grey[600]
  },
  background: {
    default: common.white,
    header: brand.violet
  },
  divider: grey[200],
  shadow: grey[600]
})

export const darkTheme = createTheme(colorsTheme, {
  component: {
    tab: {
      main: common.white
    },
    table: {
      main: brand.darkGrey,
      hover: grey[900],
      border: grey[800]
    }
  },
  primary: {
    light: brand.violet,
    main: brand.violet,
    dark: brand.violet
  },
  secondary: {
    light: grey[500],
    main: grey[700],
    dark: grey[900]
  },
  text: {
    primary: common.white,
    secondary: common.white,
    disabled: common.white
  },
  background: {
    default: common.black,
    header: grey[900]
  },
  divider: grey[900],
  shadow: common.black
})

export const vars = { ...root, colors: colorsTheme }
