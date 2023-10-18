// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"

import { Tab as TabType } from "types/config"
import Section from "./Section"

interface TabProps {
  tab: TabType
  digest: Digest
}

export default function Tab({ tab, digest }: TabProps) {
  return (
    <section className="chapter" id="tab.id">
      <h2 id={tab.id}>{tab.title}</h2>
      <p>{tab.summary}</p>
      {tab.sections.map((section) => (
        <Section key={section.id} section={section} digest={digest} />
      ))}
    </section>
  )
}
