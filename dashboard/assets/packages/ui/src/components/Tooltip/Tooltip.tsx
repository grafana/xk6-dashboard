// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState, type ReactElement } from "react"
import { type Placement } from "@popperjs/core"
import { usePopper } from "react-popper"

import { getArrowPosition, getPopperPlacement } from "./Tooltip.utils"
import { arrow, popper } from "./Tooltip.css"
import { useTheme } from "store/theme"

interface TooltipProps {
  children: ReactElement
  placement?: Placement
  title?: string
}

export function Tooltip({ children, placement = "bottom-start", title }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()

  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      { name: "offset", options: { offset: [0, 5] } }
    ]
  })

  const arrowPosition = getArrowPosition(getPopperPlacement(attributes))

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
          <div ref={setArrowElement} className={arrow[arrowPosition]} style={styles.arrow} />
        </div>
      )}
    </>
  )
}
