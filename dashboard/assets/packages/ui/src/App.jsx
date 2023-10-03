// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Tabs, Tab as TabNav, Box } from "@mui/material"
import { PropTypes } from "prop-types"

import "./App.css"

import Header from "./Header"
import Tab from "./Tab"

import { useDigest } from "./digest"

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`
  }
}

function TabPanel({ children, active, idx, ...other }) {
  return (
    <div role="tabpanel" hidden={active !== idx} id={`tabpanel-${idx}`} aria-labelledby={`tab-${idx}`} {...other}>
      <Box p={3} sx={{ padding: "0.5rem" }}>
        {children}
      </Box>
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  idx: PropTypes.any.isRequired,
  active: PropTypes.any.isRequired
}

export default function App() {
  const config = useDigest().config
  const [active, setActive] = React.useState(0)

  return (
    <>
      <Header config={config} />
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={active} onChange={(_, val) => setActive(val)}>
          {config.tabs.map((tab, idx) => (
            <TabNav key={tab.id} label={tab.title} {...a11yProps(idx)} />
          ))}
        </Tabs>
      </Box>
      {config.tabs.map((tab, idx) => (
        <TabPanel key={tab.id} active={active} idx={idx}>
          <Tab tab={tab} />
        </TabPanel>
      ))}
    </>
  )
}
