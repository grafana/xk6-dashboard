/** @format */

import React, { forwardRef, ReactNode, Ref, ElementType, HTMLAttributes } from "react"

import { toClassName } from "utils"

import { FlexElementProps } from "./Flex.types"
import { root, variants } from "./Flex.css"

export interface FlexProps extends HTMLAttributes<HTMLOrSVGElement>, FlexElementProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

function FlexBase(
  { children, as: Tag = "div", className, align, direction, gap = 1, justify, wrap, ...props }: FlexProps,
  ref: Ref<HTMLElement>
) {
  const classNames = toClassName(
    className,
    root,
    variants({
      alignItems: align,
      flexDirection: direction,
      flexWrap: wrap,
      gap,
      justifyContent: justify
    })
  )

  return (
    <Tag ref={ref} className={classNames} {...props}>
      {children}
    </Tag>
  )
}

export const Flex = forwardRef(FlexBase)
