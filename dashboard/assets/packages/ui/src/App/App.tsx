// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState, ReactNode } from "react"

import "theme/global.css"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Flex } from "components/Flex"
import { Footer } from "components/Footer/Footer"
import { Header } from "components/Header"
import { LoadingContainer } from "components/LoadingContainer"
import { Section } from "components/Section/Section"

import * as styles from "./App.css"

export default function App() {
  const digest = useDigest()
  const { themeClassName } = useTheme()
  const [tab, setTab] = useState(0)

  const hasData = !!digest.samples.length

  return (
    <Flex className={`${themeClassName} ${styles.container}`} direction="column" gap={0}>
      <Header config={digest.config} tab={tab} onTabChange={setTab} />
      <Flex as="main" className={styles.main} direction="column" grow={!hasData ? 1 : 0}>
        <LoadingContainer isLoading={!hasData} message="Loading...">
          {digest.config.tabs.map((data, idx) => (
            <TabPanel key={data.id} active={tab} idx={idx}>
              {data.sections.map((section) => (
                <Section key={section.id} section={section} />
              ))}
            </TabPanel>
          ))}
        </LoadingContainer>
      </Flex>
      <Footer />
    </Flex>
  )
}

interface TabPanelProps {
  children: ReactNode
  active: number
  idx: number
}

function TabPanel({ children, active, idx }: TabPanelProps) {
  if (active !== idx) {
    return null
  }

  return (
    <Flex direction="column" gap={3}>
      {children}
    </Flex>
  )
}
