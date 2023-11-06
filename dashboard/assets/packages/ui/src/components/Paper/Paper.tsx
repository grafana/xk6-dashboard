// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type HTMLAttributes, type Ref } from "react"

import { toClassName } from "utils"

import { styles } from "./Paper.css"

interface PaperProps extends HTMLAttributes<HTMLDivElement> {}

function PaperBase({ children, className, ...props }: PaperProps, ref: Ref<HTMLDivElement>) {
  return (
    <div ref={ref} className={toClassName(styles, className)} {...props}>
      {children}
    </div>
  )
}

export const Paper = forwardRef(PaperBase)
