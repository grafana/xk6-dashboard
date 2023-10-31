// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { createContext, useContext, type ReactNode } from "react"

import { Flex } from "../Flex"

import { tabBase, tabVariants, tabsBase } from "./Tabs.css"
import { toClassName } from "utils"

interface ContextProps {
  value: number
  onChange: (index: number) => void
}

export interface TabsProps extends ContextProps {
  children: ReactNode
  className?: string
}

export interface TabProps {
  className?: string
  label?: string
  index: number
}

const Context = createContext<Partial<ContextProps>>({})

function TabsBase({ children, className, value, onChange, ...props }: TabsProps) {
  const context = {
    value,
    onChange
  }

  return (
    <Flex gap={2} className={toClassName(tabsBase, className)} {...props}>
      <Context.Provider value={context}>{children}</Context.Provider>
    </Flex>
  )
}

function TabBase({ label, index, ...props }: TabProps) {
  const { value, onChange } = useContext(Context) as ContextProps
  const state = index === value ? "active" : "inactive"

  return (
    <div
      className={toClassName(tabBase, tabVariants({ borderBottom: state, color: state }))}
      onClick={() => onChange(index)}
      {...props}>
      {label}
    </div>
  )
}

export const Tabs = Object.assign(TabsBase, {
  Tab: TabBase
})
