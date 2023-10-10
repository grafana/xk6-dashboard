// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { createContext, useMemo, useState, ReactNode } from "react"
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material"
import { createTheme } from "@mui/material/styles"
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} from "@mui/material/colors"

import { Color } from "types/theme"

import "./Themed.css"

export const ColorModeContext = createContext({ toggleColorMode: () => {} })

const colors: Record<string, Color> = {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} as const

const order = [
  "grey",
  "teal",
  "blue",
  "purple",
  "indigo",
  "orange",
  "pink",
  "green",
  "cyan",
  "amber",
  "lime",
  "brown",
  "lightGreen",
  "red",
  "deepPurple",
  "lightBlue",
  "yellow",
  "deepOrange",
  "blueGrey"
] as const

interface ThemedProps {
  children: ReactNode
}

export default function Themed({ children }: ThemedProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [mode, setMode] = useState<"dark" | "light">(prefersDarkMode ? "dark" : "light")

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
      }
    }),
    []
  )

  const theme = useMemo(() => {
    const extra = []

    for (let i = 0; i < order.length; i++) {
      const name = order[i]
      const color = {
        stroke: mode == "dark" ? colors[name][500] : colors[name][800],
        fill: (mode == "dark" ? colors[name][300] : colors[name][600]) + "20"
      }

      colors[name].stroke = mode ? "dark" : colors[name][500]
      extra.push(color)
    }

    const theme = createTheme({
      palette: {
        mode,
        primary: {
          main: "#7b65fa"
        },
        secondary: {
          main: "#A47D4F"
        },
        color: extra
      }
    })

    return createTheme(theme, {
      palette: {
        mode
      }
    })
  }, [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
