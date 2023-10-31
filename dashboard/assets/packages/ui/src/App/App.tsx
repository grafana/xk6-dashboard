// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState, ReactNode } from "react"

import "theme/global.css"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Flex } from "components/Flex"
import { Header } from "components/Header"
import { Section } from "components/Section/Section"
import { Tabs } from "components/Tabs/Tabs"

import * as styles from "./App.css"
import { getA11yProps } from "./App.utils"

interface TabPanelProps {
  children: ReactNode
  active: number
  idx: number
}

function TabPanel({ children, active, idx, ...other }: TabPanelProps) {
  if (active !== idx) {
    return null
  }

  return (
    <div role="tabpanel" id={`tabpanel-${idx}`} aria-labelledby={`tab-${idx}`} {...other}>
      <Flex direction="column" gap={3}>
        {children}
      </Flex>
    </div>
  )
}

export default function App() {
  const { config } = useDigest()
  const { themeClassName } = useTheme()
  const [active, setActive] = useState(0)

  return (
    <div className={`${themeClassName} ${styles.container}`}>
      <header className={styles.header}>
        <Header config={config} />
        <Tabs value={active} onChange={setActive}>
          {config.tabs.map((tab, idx) => (
            <Tabs.Tab key={tab.id} label={tab.title} index={idx} {...getA11yProps(idx)} />
          ))}
        </Tabs>
      </header>
      <main className={styles.main}>
        {config.tabs.map((tab, idx) => (
          <TabPanel key={tab.id} active={active} idx={idx}>
            {tab.sections.map((section) => (
              <Section key={section.id} section={section} />
            ))}
          </TabPanel>
        ))}
      </main>
    </div>
  )
}
