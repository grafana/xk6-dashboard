// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';

import './Header.css'
import { AppBar, Typography, Toolbar, Button } from '@mui/material'

export default function Header(props) {
  return (
    <div className="Header">
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" align="center" sx={{ flexGrow: 1 }}>{props.title}</Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}
