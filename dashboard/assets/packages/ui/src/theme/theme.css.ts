/** @format */

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
    table: {
      main: null,
      hover: null,
      border: null
    }
  },
  primary: {
    main: null
  },
  text: {
    primary: null,
    secondary: null
  },
  background: {
    default: null,
    header: null
  },
  divider: null
})

export const lightTheme = createTheme(colorsTheme, {
  component: {
    table: {
      main: grey[100],
      hover: grey[200],
      border: grey[300]
    }
  },
  primary: {
    main: brand.violet
  },
  text: {
    primary: common.black,
    secondary: common.white
  },
  background: {
    default: common.white,
    header: brand.violet
  },
  divider: grey[200]
})

export const darkTheme = createTheme(colorsTheme, {
  component: {
    table: {
      main: brand.darkGrey,
      hover: grey[900],
      border: grey[800]
    }
  },
  primary: {
    main: brand.violet
  },
  text: {
    primary: common.white,
    secondary: common.white
  },
  background: {
    default: common.black,
    header: grey[900]
  },
  divider: grey[900]
})

export const vars = { ...root, colors: colorsTheme }
