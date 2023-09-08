// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SSEProvider } from 'react-hooks-sse';
import { ThemeProvider, createTheme } from '@mui/material'
import Dashboard from './Dashboard'
import './index.css'

const base = new URLSearchParams(window.location.search).get("endpoint") || "http://localhost:5665/";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7b65fa',
    },
    secondary: {
      main: '#A47D4F',
    },
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SSEProvider endpoint={base + "events"}>
      <ThemeProvider theme={theme}>
        <Dashboard/>
      </ThemeProvider>
    </SSEProvider>
  </React.StrictMode>,
)
