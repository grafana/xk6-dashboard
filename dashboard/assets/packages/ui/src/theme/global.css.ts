// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { globalStyle } from "@vanilla-extract/css"

import { fonts, letterSpacings } from "./typography.css"

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
  margin: 0,
  padding: 0
})

globalStyle("*", {
  fontFamily: fonts.sans
})

globalStyle("html, body, #root", {
  height: "100%"
})

globalStyle("html", {
  fontSize: "62.5%",
  letterSpacing: letterSpacings.size3
})

globalStyle("body", {
  lineHeight: 1.5,
  fontSmooth: "auto",
  textRendering: "optimizeLegibility"
})

globalStyle("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%"
})

globalStyle("input, button, textarea, select", {
  font: "inherit"
})

globalStyle("p, h1, h2, h3, h4, h5, h6", {
  overflowWrap: "break-word"
})

globalStyle("#root", {
  isolation: "isolate"
})
