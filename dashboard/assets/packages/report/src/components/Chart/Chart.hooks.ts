// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { useLayoutEffect, useState } from "preact/hooks"

type Width = number

export const useElementWidth = <T extends HTMLElement = HTMLDivElement>(): [(node: T | null) => void, Width] => {
  const [ref, setRef] = useState<T | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (ref) {
        setWidth(ref.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)

    return () => window.removeEventListener("resize", updateWidth)
  })

  return [setRef, width]
}
