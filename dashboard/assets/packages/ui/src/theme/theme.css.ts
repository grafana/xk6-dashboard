// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { createGlobalTheme, createTheme, createThemeContract } from "@vanilla-extract/css"

import { common, grey, midnight, violet } from "./colors.css"
import { sizes } from "./sizes.css"
import * as animation from "./animation.css"
import * as typography from "./typography.css"

const borderRadius = {
  sm: "3px",
  md: "5px",
  lg: "10px",
  xl: "25px"
}

const root = createGlobalTheme(":root", {
  borderRadius,
  sizes,
  animation,
  ...typography
})

const colorsTheme = createThemeContract({
  common,
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
    disabled: null,
    hover: null
  },
  action: {
    active: null,
    hover: null
  },
  shadow: null,
  border: null,
  components: {
    button: {
      outline: {
        border: null,
        text: null,
        background: null
      }
    },
    table: {
      row: {
        hover: null
      }
    }
  }
})

export const lightTheme = createTheme(colorsTheme, {
  common,
  primary: {
    light: violet[100],
    main: violet[200],
    dark: violet[300]
  },
  secondary: {
    light: common.white,
    main: grey[50],
    dark: grey[200]
  },
  text: {
    primary: grey[900],
    secondary: grey[700],
    disabled: grey[400],
    hover: grey[500]
  },
  action: {
    active: grey[300],
    hover: grey[200]
  },
  shadow: grey[300],
  border: grey[300],
  components: {
    button: {
      outline: {
        border: violet[200],
        text: violet[200],
        background: violet[50]
      }
    },
    table: {
      row: {
        hover: grey[200]
      }
    }
  }
})

export const darkTheme = createTheme(colorsTheme, {
  common,
  primary: {
    light: violet[100],
    main: violet[200],
    dark: violet[300]
  },
  secondary: {
    light: midnight[700],
    main: midnight[800],
    dark: midnight[900]
  },
  text: {
    primary: common.white,
    secondary: midnight[100],
    disabled: midnight[600],
    hover: midnight[50]
  },
  action: {
    active: midnight[600],
    hover: midnight[700]
  },
  shadow: midnight[900],
  border: midnight[700],
  components: {
    button: {
      outline: {
        border: violet[100],
        text: violet[100],
        background: violet[600]
      }
    },
    table: {
      row: {
        hover: midnight[600]
      }
    }
  }
})

const breakpoints = {
  header: sizes.lg
}

export const vars = { ...root, breakpoints, colors: colorsTheme }
