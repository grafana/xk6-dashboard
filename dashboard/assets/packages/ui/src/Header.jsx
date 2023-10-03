// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useContext } from "react"

import { Button, IconButton, AppBar, Typography, Toolbar, useTheme } from "@mui/material"

import { ReactComponent as DarkModeIcon } from "./icons/dark_mode.svg"
import { ReactComponent as LightModeIcon } from "./icons/light_mode.svg"

import "./Header.css"

import { ColorModeContext } from "./Themed"

export default function Header({ config: { title } }) {
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)

  return (
    <div className="Header">
      <AppBar position="sticky" color="primary">
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" align="center" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Button variant="text" color="inherit" onClick={() => window.open("../report", "k6-report")}>
            Report
          </Button>
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  )
}
