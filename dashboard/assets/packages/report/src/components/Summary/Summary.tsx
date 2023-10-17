// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"
import { Panel, SummaryTable } from "@xk6-dashboard/view"

import "./Summary.css"

interface SummaryProps {
  panel: Panel
  digest: Digest
}

export default function Summary({ panel, digest }: SummaryProps) {
  const table = new SummaryTable(panel, digest)

  if (table.empty) {
    return <div />
  }

  return (
    <div className="panel">
      <table className="table table-hover caption-top">
        <caption>{panel.title}</caption>
        <thead>
          <tr>
            {table.header.map((name, idx) => (
              <th key={panel.id + "header" + name} align={idx == 0 ? "left" : "right"}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.body.map((row, idx) => (
            <tr key={panel.id + "row" + idx}>
              {row.map((cell, cidx) => (
                <td key={panel.id + "_value_" + idx + "_" + cidx} align={cidx == 0 ? "left" : "right"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
