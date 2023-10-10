// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Grid, Table, TableContainer, TableCell, TableHead, TableRow, TableBody, useTheme } from "@mui/material"
import { Panel, SummaryTable } from "@xk6-dashboard/view"

import { useDigest } from "store/digest"

import "./Summary.css"

interface SummaryProps {
  panel: Panel
}

export default function Summary({ panel }: SummaryProps) {
  const digest = useDigest()
  const theme = useTheme()

  const table = new SummaryTable(panel, digest)

  if (table.empty) {
    return <div />
  }

  const num = table.view.aggregates.length

  const lg = num > 6 ? 12 : num > 1 ? 6 : 3
  const md = num > 6 ? 12 : num > 1 ? 12 : 6

  const bg = theme.palette.mode == "dark" ? "#202020c0" : "#f6f6f6c0"

  return (
    <Grid className="panel" item xs={12} md={md} lg={lg}>
      <TableContainer key={panel.id} className="summary" sx={{ background: bg }}>
        <Table>
          <caption>{panel.title}</caption>
          <TableHead>
            <TableRow>
              {table.header.map((name, idx) => (
                <TableCell key={panel.id + "header" + name} align={idx == 0 ? "left" : "right"}>
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.body.map((row, idx) => (
              <TableRow key={panel.id + "row" + idx} hover={true} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                {row.map((cell, cidx) => (
                  <TableCell key={panel.id + "_value_" + idx + "_" + cidx} align={cidx == 0 ? "left" : "right"}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
