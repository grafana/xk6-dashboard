// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

export const omitUndefined = <T extends object>(styles: T) => {
  return Object.entries(styles).reduce(
    (props, [prop, value]) => (value === undefined ? props : { ...props, [prop]: value }),
    {}
  )
}

export const pick = (props: string[], obj: object) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (props.includes(key)) {
        acc[key] = value
      }

      return acc
    },
    {} as { [key: string]: unknown }
  )

export const mergeRight = (a: object, b: object) => ({ ...a, ...b })

export const mergeRightProps = (props: string[]) => (a: object, b: object) => mergeRight(a, pick(props, b))
