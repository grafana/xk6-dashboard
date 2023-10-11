// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState, ReactNode } from "react"
import { Tabs, Tab as TabNav, Box } from "@mui/material"

import { useDigest } from "store/digest"
import Header from "components/Header"
import Tab from "components/Tab"

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`
  }
}

interface TabPanelProps {
  children: ReactNode
  active: number
  idx: number
}

function TabPanel({ children, active, idx, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={active !== idx} id={`tabpanel-${idx}`} aria-labelledby={`tab-${idx}`} {...other}>
      <Box p={3} sx={{ padding: "0.5rem" }}>
        {children}
      </Box>
    </div>
  )
}

export default function App() {
  const config = useDigest().config
  const [active, setActive] = useState(0)

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
