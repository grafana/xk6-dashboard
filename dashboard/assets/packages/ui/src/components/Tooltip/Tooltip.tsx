// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState, type ReactElement } from "react"
import { usePopper } from "react-popper"

import { popper } from "./Tooltip.css"
import { useTheme } from "store/theme"

interface TooltipProps {
  children: ReactElement
  title?: string
}

export function Tooltip({ children, title }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start"
  })
  const { theme } = useTheme()

  if (!title) {
    return children
  }

  return (
    <>
      <div ref={setReferenceElement} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
        {children}
      </div>

      {isOpen && (
        <div ref={setPopperElement} className={popper[theme]} style={styles.popper} {...attributes.popper}>
          {title}
        </div>
      )}
    </>
  )
}
