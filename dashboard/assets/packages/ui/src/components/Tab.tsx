// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import Section from "./Section"

interface TabProps {
  tab: any
}

export default function Tab({ tab }: TabProps) {
  return (
    <>
      {tab.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </>
  )
}
