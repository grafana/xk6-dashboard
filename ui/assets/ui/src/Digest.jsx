// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { useContext } from 'react'
import './Digest.css'

import { Table, TableContainer, TableCell, TableHead, TableRow, TableBody, Paper } from '@mui/material'
import { SummaryContext } from './summary';
import { iterable } from './util';

const propertyNames = {
  'trend': ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  'counter': ["rate", "count"],
  'rate': ["rate"],
  'gauge': ["value"]
}

export function Digest(props) {
  const { type, series } = props

  const summary = useContext(SummaryContext)

  const filter = (key) => (!iterable(series) || series.includes(key)) && (summary.values[key].type == type)

  const component = props.plain ? "div" : Paper

  return (
    <TableContainer key={"digest_" + type} component={component}>

      <Table>
        <caption>{props.caption}</caption>
        <TableHead>
          <TableRow>
            <TableCell>metric</TableCell>
            {
              propertyNames[type].map((name) => (<TableCell key={"digest_" + type + "_" + name} align="right">{name}</TableCell>))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            Object.keys(summary.values).filter(filter).map(key => (
              <TableRow key={key} hover={true} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{key}</TableCell>
                {
                  propertyNames[type].map((name) => (
                    <TableCell key={"digest_" + type + "_value_" + name} align="right">
                      {
                        summary.values[key].format(name)
                      }
                    </TableCell>
                  ))
                }
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}
