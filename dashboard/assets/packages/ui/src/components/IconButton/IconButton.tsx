// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, Ref } from "react"

import { toClassName } from "utils"
import { Button, ButtonProps } from "components/Button"
import { Icon, type IconMap } from "components/Icon"

import * as styles from "./IconButton.css"

interface IconButtonProps extends Omit<ButtonProps, "children"> {
  name: keyof typeof IconMap
  title?: string
}

function IconButtonBase(
  { className, name, title, variant = "fill", ...props }: IconButtonProps,
  ref: Ref<HTMLButtonElement & HTMLAnchorElement>
) {
  return (
    <Button ref={ref} className={toClassName(styles.button, className)} variant={variant} {...props}>
      <Icon className={styles.icon[variant]} name={name} title={title} />
    </Button>
  )
}

export const IconButton = forwardRef(IconButtonBase)
