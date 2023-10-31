// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import { toClassName } from "utils"
import { Button } from "components/Button"
import { Flex } from "components/Flex"

import * as styles from "./Nav.css"

interface Option {
  title?: string
  id?: string
}

interface NavProps {
  isMobile?: boolean
  options: Option[]
  value: number
  onChange: (idx: number) => void
}

export function Nav({ isMobile = false, options, value, onChange }: NavProps) {
  return (
    <Flex
      as="nav"
      gap={2}
      className={toClassName(
        styles.nav,
        styles.navVariant({
          display: {
            desktop: isMobile ? "none" : "flex",
            mobile: isMobile ? "flex" : "none"
          }
        })
      )}>
      {options.map((option, index) => (
        <Item
          key={option.id}
          aria-controls={`nav-${index}`}
          label={option.title}
          index={index}
          value={value}
          onChange={onChange}
        />
      ))}
    </Flex>
  )
}

interface ItemProps {
  index: number
  label?: string
  value: number
  onChange: (idx: number) => void
}

function Item({ index, label, value, onChange, ...props }: ItemProps) {
  const isActive = index === value
  const state = isActive ? "active" : "inactive"

  return (
    <Button aria-current={isActive} className={styles.item[state]} variant="text" onClick={() => onChange(index)} {...props}>
      {label}
    </Button>
  )
}
