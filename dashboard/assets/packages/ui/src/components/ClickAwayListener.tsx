// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { cloneElement, useRef, type ReactElement } from "react"
import { useEventCallback, useEventListener } from "usehooks-ts"

import { useForkRef } from "hooks"

export interface ClickAwayListenerProps {
  children: ReactElement
  onClickAway: (event: MouseEvent | KeyboardEvent) => void
}

export const ClickAwayListener = ({ children, onClickAway }: ClickAwayListenerProps) => {
  const documentRef = useRef<Document>(document)
  const nodeRef = useRef<Element>(null)
  // @ts-expect-error TODO upstream fix
  const handleRef = useForkRef(nodeRef, children.ref)

  const handleClickAway = useEventCallback((event: MouseEvent | KeyboardEvent) => {
    if (!nodeRef.current) {
      throw new Error("ClickAwayListener: missing ref")
    }

    // @ts-expect-error TODO upstream fix
    const isInDOM = !documentRef.current.contains(event.target) || nodeRef.current.contains(event.target)

    if (event.type === "keyup" && "key" in event) {
      if (!["Escape", "Tab"].includes(event.key)) {
        return
      }

      if (event.key === "Tab" && isInDOM) {
        return
      }
    }

    if (event.type === "mouseup" && isInDOM) {
      return
    }

    onClickAway(event)
  })

  useEventListener("mouseup", handleClickAway, documentRef)
  useEventListener("keyup", handleClickAway, documentRef)

  return <>{cloneElement(children, { ref: handleRef })}</>
}
