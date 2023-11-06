// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState, type ReactNode } from "react"
import { usePopper } from "react-popper"

import { useTheme } from "store/theme"
import { Button } from "components/Button"
import { ClickAwayListener } from "components/ClickAwayListener"
import { Flex } from "components/Flex"
import { IconButton } from "components/IconButton"
import { Paper } from "components/Paper"

import { popper, item } from "./Menu.css"

interface MenuProps {
  children: ReactNode
}

export function MenuBase({ children }: MenuProps) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
    modifiers: [{ name: "offset", options: { offset: [0, 10] } }]
  })

  return (
    <>
      <IconButton
        ref={setReferenceElement}
        aria-expanded={isOpen ? "true" : "false"}
        aria-label="Menu"
        name="options"
        variant="text"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <Paper
            {...attributes.popper}
            ref={setPopperElement}
            className={popper[theme]}
            style={styles.popper}
            onMouseLeave={() => setIsOpen(false)}>
            <Flex direction="column" gap={0}>
              {children}
            </Flex>
          </Paper>
        </ClickAwayListener>
      )}
    </>
  )
}

interface MenuItemProps {
  children: ReactNode
  onClick?: () => void
}

function MenuItem({ children, onClick }: MenuItemProps) {
  return (
    <Button variant="text" onClick={onClick}>
      <Flex className={item} align="center" gap={2}>
        {children}
      </Flex>
    </Button>
  )
}

export const Menu = Object.assign(MenuBase, {
  Item: MenuItem
})
