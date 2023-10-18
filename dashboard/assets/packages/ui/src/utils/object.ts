// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

export const omitUndefined = <T extends object>(styles: T) => {
  return Object.entries(styles).reduce(
    (props, [prop, value]) => (value === undefined ? props : { ...props, [prop]: value }),
    {}
  )
}
