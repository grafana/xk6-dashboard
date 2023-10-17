// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { createContext, useContext, useState, Dispatch, ReactNode, SetStateAction } from "react"

import { darkTheme, lightTheme } from "theme"

type Themes = "light" | "dark"

interface ThemeContextProps {
  theme: Themes
  themeClassName: string
  setTheme: Dispatch<SetStateAction<Themes>>
}

const ThemeContext = createContext<Partial<ThemeContextProps>>({})

interface ThemeProviderProps {
  children: ReactNode
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Themes>("light")

  const context = {
    theme,
    themeClassName: theme === "light" ? lightTheme : darkTheme,
    setTheme
  }

  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
}

function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context as ThemeContextProps
}

export { ThemeProvider, useTheme }