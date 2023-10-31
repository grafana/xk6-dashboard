// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"

import { Tab as TabType } from "types/config"
import { Flex } from "components/Flex"
import { Section } from "components/Section"

import * as styles from "./Tab.css"

interface TabProps {
  tab: TabType
  digest: Digest
}

export function Tab({ tab, digest }: TabProps) {
  return (
    <Flex id={tab.id} direction="column" gap={4}>
      <div className={styles.header}>
        <h2 className={styles.title}>{tab.title}</h2>
        <p>{tab.summary}</p>
      </div>

      {tab.sections.map((section) => (
        <Section key={section.id} section={section} digest={digest} />
      ))}
    </Flex>
  )
}
