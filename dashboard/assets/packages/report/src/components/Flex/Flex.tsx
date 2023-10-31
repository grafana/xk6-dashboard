// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type ReactNode, type Ref, type ElementType, type HTMLAttributes } from "react"

import { toClassName, toStyle } from "utils"

import type { FlexElementProps } from "./Flex.types"
import { root, theme, variants } from "./Flex.css"

export interface FlexProps extends HTMLAttributes<HTMLOrSVGElement>, FlexElementProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

function FlexBase(
  {
    as: Tag = "div",
    align,
    basis,
    children,
    className,
    direction,
    gap = 3,
    grow,
    height,
    justify,
    padding,
    shrink,
    width,
    wrap,
    ...props
  }: FlexProps,
  ref: Ref<HTMLElement>
) {
  const variantClassName = variants({
    alignItems: align,
    flexDirection: direction,
    flexWrap: wrap,
    gap,
    justifyContent: justify,
    padding
  })

  const classNames = toClassName(root, variantClassName, className)
  const styles = toStyle(theme, { flexBasis: basis, flexGrow: grow, flexShrink: shrink, height, width })

  return (
    <Tag ref={ref} className={classNames} style={styles} {...props}>
      {children}
    </Tag>
  )
}

export const Flex = forwardRef(FlexBase)
