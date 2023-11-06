// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { useMemo, type MutableRefObject, type RefCallback, type Ref } from "react"

type PossibleRef<T> = Ref<T> | undefined

function setRef<T>(ref: PossibleRef<T> | null, value: T) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref !== null && ref !== undefined) {
    ;(ref as MutableRefObject<T>).current = value
  }
}

export function useForkRef<T>(refA: PossibleRef<T> | null, refB: PossibleRef<T> | null): RefCallback<T> | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior
   */
  return useMemo(() => {
    if (refA === null && refB === null) {
      return null
    }

    return (refValue: T) => {
      setRef(refA, refValue)
      setRef(refB, refValue)
    }
  }, [refA, refB])
}
