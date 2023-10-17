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

import { Colors, VectorAttrs } from "types/theme"

import "./Themed.css"

export const ColorModeContext = createContext({ toggleColorMode: () => {} })

const colorMap: Record<string, Colors & Partial<VectorAttrs>> = {
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
    const vectorAttrsArr = []

    for (let i = 0; i < order.length; i++) {
      const name = order[i]
      const vectorAttrs = {
        stroke: mode == "dark" ? colorMap[name][500] : colorMap[name][800],
        fill: (mode == "dark" ? colorMap[name][300] : colorMap[name][600]) + "20"
      }

      colorMap[name].stroke = mode ? "dark" : colorMap[name][500]
      vectorAttrsArr.push(vectorAttrs)
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
        color: vectorAttrsArr
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
