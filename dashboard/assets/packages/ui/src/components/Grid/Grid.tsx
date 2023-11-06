// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type ElementType, type ReactNode, type Ref, type HTMLAttributes } from "react"

import type { GridElementProps, GridColumnElementProps } from "./Grid.types"
import { column, container } from "./Grid.css"
import { toClassName } from "utils"

export interface GridProps extends HTMLAttributes<HTMLOrSVGElement>, GridElementProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

export interface GridColumnProps extends HTMLAttributes<HTMLOrSVGElement>, GridColumnElementProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

function GridBase({ as: Tag = "div", gap = 3, children, className, ...props }: GridProps, ref: Ref<HTMLElement>) {
  return (
    <Tag ref={ref} className={toClassName(className, container.root, container.variants({ gap }))} {...props}>
      {children}
    </Tag>
  )
}

function Column(
  { children, as: Tag = "div", className, xs = 12, sm, md, lg, xl, xxl, ...props }: GridColumnProps,
  ref: Ref<HTMLElement>
) {
  return (
    <Tag
      ref={ref}
      className={toClassName(
        className,
        column({
          gridColumn: {
            xs,
            sm,
            md,
            lg,
            xl,
            xxl
          }
        })
      )}
      {...props}>
      {children}
    </Tag>
  )
}

export const Grid = Object.assign(forwardRef(GridBase), {
  Column: forwardRef(Column)
})
