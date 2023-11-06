// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Panel, SummaryTable } from "@xk6-dashboard/view"

import { useDigest } from "store/digest"
import { Grid } from "components/Grid"
import { Table } from "components/Table"

import * as styles from "./Summary.css"
import { Card } from "components/Card"

interface SummaryProps {
  panel: Panel
}

export default function Summary({ panel }: SummaryProps) {
  const digest = useDigest()
  const table = new SummaryTable(panel, digest)

  if (table.empty) {
    return <div />
  }

  const num = table.view.aggregates.length
  const lg = num > 6 ? 12 : num > 1 ? 6 : 3
  const md = num > 6 ? 12 : num > 1 ? 12 : 6

  return (
    <Grid.Column xs={12} md={md} lg={lg}>
      <Card key={panel.id} className={styles.container} title={panel.title}>
        <div className={styles.body}>
          <Table>
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
      </Card>
    </Grid.Column>
  )
}
