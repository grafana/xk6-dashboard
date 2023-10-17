/** @format */

import { MouseEvent, ReactNode, Ref } from "react"
import React, { forwardRef } from "react"

import { toClassName } from "utils"

import * as styles from "./Button.css"

type HTMLComboElement = HTMLButtonElement & HTMLAnchorElement

export type ButtonProps = {
  as?: "button" | "a"
  children: ReactNode
  className?: string
  disabled?: boolean
  href?: string
  onClick?: (event: MouseEvent<HTMLComboElement>) => void
  type?: "button" | "submit" | "reset"
}

const ButtonBase = ({ as: Tag = "button", children, className, ...props }: ButtonProps, ref: Ref<HTMLComboElement>) => {
  return (
    <Tag ref={ref} className={toClassName(styles.root, className)} {...props}>
      {children}
    </Tag>
  )
}

export const Button = forwardRef(ButtonBase)
