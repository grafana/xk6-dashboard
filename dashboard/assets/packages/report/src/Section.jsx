// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import { SummaryTable, isEmptySection } from "@xk6-dashboard/view"

import Panel from "./Panel"

export default function Section({ section, digest }) {
  const empty = isEmptySection(section, digest)

  if (empty) {
    return <></>
  }

  const foo = (panel) => {
    if (panel.kind == "chart") {
      return "col-lg-6 rcol-md-12"
    }

    if (panel.kind == "summary") {
      const table = new SummaryTable(panel, digest)

      const num = table.view.aggregates.length

      const lg = num > 6 ? 12 : num > 1 ? 6 : 3
      const md = num > 6 ? 12 : num > 1 ? 12 : 6

      return `col-md-${md} col-lg-${lg}`
    }

    return ""
  }

  return (
    <div className="section">
      <h3>{section.title}</h3>
      <p>{section.summary}</p>
      <div className="row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2" key={section.id + "row"}>
        {section.panels.map((panel) => (
          <div key={panel.id + "col"} className={"col " + foo(panel)}>
            <Panel key={panel.id} panel={panel} digest={digest} columns={section.columns} />
          </div>
        ))}
      </div>
    </div>
  )
}
