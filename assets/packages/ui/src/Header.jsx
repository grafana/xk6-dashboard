// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from 'react';

import './Header.css'
import { AppBar, Typography, Toolbar, Button } from '@mui/material'

export default function Header(props) {
  return (
    <div className="Header">
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" align="center" sx={{ flexGrow: 1 }}>{props.conf().title}</Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}
