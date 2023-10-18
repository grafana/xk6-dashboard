// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type MouseEvent, type ReactNode, type Ref } from "react"

import { toClassName } from "utils"

import * as styles from "./Button.css"

type HTMLComboElement = HTMLButtonElement & HTMLAnchorElement

interface CommonProps {
  children: ReactNode
  className?: string
  onClick?: (event: MouseEvent<HTMLComboElement>) => void
}

interface ButtonProps extends CommonProps {
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

const ButtonBase = ({ as: Tag = "button", children, className, ...props }: Props, ref: Ref<HTMLComboElement>) => {
  return (
    <Tag ref={ref} className={toClassName(styles.root, className)} {...props}>
      {children}
    </Tag>
  )
}

export const Button = forwardRef(ButtonBase)
