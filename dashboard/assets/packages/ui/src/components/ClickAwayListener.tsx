/** @format */

import React, { cloneElement, useRef, type ReactElement } from "react"
import { useEventCallback, useEventListener } from "usehooks-ts"

import { useForkRef } from "hooks"

export interface ClickAwayListenerProps {
  children: ReactElement
  onClickAway: (event: MouseEvent) => void
}

export const ClickAwayListener = ({ children, onClickAway }: ClickAwayListenerProps) => {
  const documentRef = useRef<Document>(document)
  const nodeRef = useRef<Element>(null)
  // @ts-expect-error TODO upstream fix
  const handleRef = useForkRef(nodeRef, children.ref)

  const handleClickAway = useEventCallback((event: MouseEvent) => {
    console.log({ documentRef, nodeRef })

    if (!nodeRef.current) {
      throw new Error("ClickAwayListener: missing ref")
    }

    // @ts-expect-error TODO upstream fix
    const isInDOM = !documentRef.current.contains(event.currentTarget) || nodeRef.current.contains(event.target)

    if (!isInDOM) {
      onClickAway(event)
    }
  })

  useEventListener("mouseup", handleClickAway, documentRef)

  return <>{cloneElement(children, { ref: handleRef })}</>
}
