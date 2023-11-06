// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { type ReactNode } from "react"

import { toClassName } from "utils"
import { Flex } from "components/Flex"
import { Icon } from "components/Icon"

import * as styles from "./Collapse.css"

interface CollapseProps {
  children: ReactNode
  title: string
  isOpen: boolean
  onClick: () => void
}

export const Collapse = ({ children, title, isOpen, onClick }: CollapseProps) => {
  return (
    <div>
      <Flex
        as="button"
        align="center"
        aria-expanded={isOpen}
        className={toClassName(styles.header, styles.border({ borderRadius: String(isOpen) as "true" | "false" }))}
        width="100%"
        onClick={onClick}>
        {isOpen ? <Icon name="chevron-up" /> : <Icon name="chevron-down" />}
        <h2 className={styles.title}>{title}</h2>
      </Flex>

      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  )
}
