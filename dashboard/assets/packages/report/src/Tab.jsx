// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import Section from "./Section"

export default function Tab({ tab, digest }) {
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
