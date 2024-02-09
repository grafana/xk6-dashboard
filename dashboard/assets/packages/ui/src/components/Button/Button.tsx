// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type MouseEvent, type ReactNode, type Ref } from "react"

import { toClassName } from "utils"

import * as styles from "./Button.css"

interface CommonProps {
  children: ReactNode
  className?: string
  variant?: "fill" | "outline" | "text"
  onClick?: (event: MouseEvent<Element>) => void
}

export interface ButtonProps extends CommonProps {
  as?: "button"
  disabled?: boolean
  href?: never
  type?: "button" | "submit" | "reset"
}

interface AnchorProps extends CommonProps {
  as: "a"
  href: string
  target?: "_blank" | "_self" | "_parent" | "_top"
  type?: never
}

type Props = ButtonProps | AnchorProps
type Element = HTMLButtonElement & HTMLAnchorElement

const ButtonBase = ({ as: Tag = "button", children, className, variant = "fill", ...props }: Props, ref: Ref<Element>) => {
  return (
    <Tag ref={ref} className={toClassName(styles.variant[variant], className)} {...props}>
      {children}
    </Tag>
  )
}

export const Button = forwardRef(ButtonBase)
