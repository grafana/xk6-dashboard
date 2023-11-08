// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { type HTMLAttributes, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react"

import * as styles from "./Table.css"

interface TableBaseProps extends TableHTMLAttributes<HTMLTableElement> {}

function TableBase({ children, ...props }: TableBaseProps) {
  return (
    <table className={styles.table} {...props}>
      {children}
    </table>
  )
}

interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

function TableHead({ children, ...props }: TableHeadProps) {
  return <thead {...props}>{children}</thead>
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

function TableBody({ children, ...props }: TableBodyProps) {
  return <tbody {...props}>{children}</tbody>
}

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {}

function TableHeader({ children, ...props }: TableHeaderProps) {
  return (
    <th className={styles.th} {...props}>
      {children}
    </th>
  )
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  isHead?: boolean
}

function TableRow({ children, isHead = false, ...props }: TableRowProps) {
  return (
    <tr className={styles.tr[isHead ? "thead" : "tbody"]} {...props}>
      {children}
    </tr>
  )
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

function TableCell({ children, ...props }: TableCellProps) {
  return (
    <td className={styles.td} {...props}>
      {children}
    </td>
  )
}

interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {}

function TableFooter({ children, ...props }: TableFooterProps) {
  return <tfoot {...props}>{children}</tfoot>
}

export const Table = Object.assign(TableBase, {
  Body: TableBody,
  Cell: TableCell,
  Footer: TableFooter,
  Head: TableHead,
  Header: TableHeader,
  Row: TableRow
})
