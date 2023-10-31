// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { assignInlineVars } from "@vanilla-extract/dynamic"

import { omitUndefined } from "./object"

type CSSVarFunction = `var(--${string})` | `var(--${string}, ${string | number})`
type Contract = {
  [key: string]: CSSVarFunction | null | Contract
}

export const toClassName = (...xs: unknown[]) => xs.filter(Boolean).join(" ")

export const toStyle = (theme: Contract, styles: Record<string, string | number | undefined>) => {
  return assignInlineVars(theme, omitUndefined(styles))
}
