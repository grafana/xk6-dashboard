// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type CSSProperties, type Ref, type ReactNode } from "react"

import { toClassName } from "utils"
import { Paper } from "components/Paper"

import * as styles from "./Card.css"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  style?: CSSProperties
  title?: string
}

function CardBase({ children, className, title, ...props }: CardProps, ref: Ref<HTMLDivElement>) {
  return (
    <Paper ref={ref} className={toClassName(styles.container, className)} {...props}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>{children}</div>
    </Paper>
  )
}

export const Card = forwardRef(CardBase)
