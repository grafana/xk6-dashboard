// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

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

const palette = {
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

export const colors = order.map((name) => {
  return {
    stroke: palette[name][800],
    fill: palette[name][600] + "20"
  }
})
