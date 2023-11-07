// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"

import "theme/global.css"
import { theme } from "theme"
import { toClassName } from "utils"
import { Flex } from "components/Flex"
import { Header } from "components/Header"
import { Tab } from "components/Tab/Tab"

import * as styles from "./App.css"

interface AppProps {
  digest: Digest
}

export default function App({ digest }: AppProps) {
  return (
    <Flex as="main" className={toClassName(theme, styles.main)} direction="column" gap={4}>
      <Header digest={digest} />

      {digest.config.tabs.map((tab) => (
        <Tab key={tab.id} tab={tab} digest={digest} />
      ))}

      <section>
        <hr />
        <p className={styles.usage}>
          Select a time interval by holding down the mouse on any graph to zoom. To cancel zoom, double click on any graph.
        </p>
      </section>
    </Flex>
  )
}
