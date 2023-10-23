// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { type ReactNode } from "react"

import * as styles from "./Progress.css"

interface ProgressProps {
  children?: ReactNode | ReactNode[]
  className?: string
  color?: string
  isLoading?: boolean
  max?: string
  value?: string | number
}

export const Progress = ({ children, isLoading = false, max = "100", value, ...props }: ProgressProps) => {
  const variant = isLoading ? "loading" : "default"

  return (
    <div className={styles.container}>
      <progress className={styles.bar[variant]} max={max} value={value} {...props} />
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  )
}
