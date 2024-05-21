// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import { Button } from "components/Button"
import { Flex } from "components/Flex"

import * as styles from "./Nav.css"
import { toClassName } from "utils"

interface Option {
  title?: string
  id?: string
}

interface NavProps {
  options: Option[]
  value: number
  onChange: (idx: number) => void
}

export function Nav({ options, value, onChange }: NavProps) {
  return (
    <nav className={toClassName(styles.nav)}>
      <Flex gap={2}>
        {options.map((option, index) => (
          <Item key={option.id} label={option.title} index={index} value={value} onChange={onChange} />
        ))}
      </Flex>
    </nav>
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
