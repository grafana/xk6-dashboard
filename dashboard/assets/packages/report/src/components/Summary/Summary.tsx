// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"
import { Panel, SummaryTable } from "@xk6-dashboard/view"

import { Table } from "components/Table"

import * as styles from "./Summary.css"

interface SummaryProps {
  panel: Panel
  digest: Digest
}

export default function Summary({ panel, digest }: SummaryProps) {
  const table = new SummaryTable(panel, digest)

  if (table.empty) {
    return null
  }

  return (
    <div className={styles.container}>
      <Table>
        <caption className={styles.caption}>{panel.title}</caption>
        <Table.Head>
          <Table.Row isHead>
            {table.header.map((name, idx) => (
              <Table.Header key={panel.id + "header" + name} align={idx == 0 ? "left" : "right"}>
                {name}
              </Table.Header>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {table.body.map((row, idx) => (
            <Table.Row key={panel.id + "row" + idx}>
              {row.map((cell, cidx) => (
                <Table.Cell key={panel.id + "_value_" + idx + "_" + cidx} align={cidx == 0 ? "left" : "right"}>
                  {cell}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}
