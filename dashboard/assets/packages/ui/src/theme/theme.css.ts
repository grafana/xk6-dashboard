/** @format */

import { createGlobalTheme, createTheme, createThemeContract } from "@vanilla-extract/css"

import { colors } from "./colors.css"
import { sizes } from "./sizes.css"
import * as typography from "./typography.css"

const root = createGlobalTheme("#root", {
  sizes,
  ...typography
})

const colorsTheme = createThemeContract({
  text: {
    primary: null,
    secondary: null
  },
  background: {
    primary: null,
    secondary: null
  },
  border: {
    primary: null,
    secondary: null
  },
  link: {
    text: null
  }
})

export const lightTheme = createTheme(colorsTheme, {
  text: {
    primary: colors.black,
    secondary: colors.white
  },
  background: {
    primary: colors.white,
    secondary: colors.purple
  },
  border: {
    primary: colors.gray1,
    secondary: colors.gray2
  },
  link: {
    text: colors.purple
  }
})

export const darkTheme = createTheme(colorsTheme, {
  text: {
    primary: colors.white,
    secondary: colors.white
  },
  background: {
    primary: colors.black,
    secondary: colors.gray10
  },
  border: {
    primary: colors.gray9,
    secondary: colors.gray10
  },
  link: {
    text: colors.purple
  }
})

export const vars = { ...root, colors: colorsTheme }
