// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Colors, VectorAttrs } from "types/theme"

import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} from "theme/colors.css"

const colors: Record<string, Colors & Partial<VectorAttrs>> = {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} as const

const order = [
  "grey",
  "teal",
  "blue",
  "purple",
  "indigo",
  "orange",
  "pink",
  "green",
  "cyan",
  "amber",
  "lime",
  "brown",
  "lightGreen",
  "red",
  "deepPurple",
  "lightBlue",
  "yellow",
  "deepOrange",
  "blueGrey"
] as const

export const createColorScheme = (mode: string) => {
  return order.map((name) => ({
    stroke: mode == "dark" ? colors[name][500] : colors[name][800],
    fill: (mode == "dark" ? colors[name][300] : colors[name][600]) + "20"
  }))
}
