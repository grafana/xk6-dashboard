// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { globalStyle } from "@vanilla-extract/css"

import { fontSizes, fonts, letterSpacings } from "./typography.css"

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
  margin: 0,
  padding: 0
})

globalStyle("*", {
  fontFamily: fonts.sans
})

globalStyle("html", {
  fontSize: "62.5%",
  MozOsxFontSmoothing: "grayscale",
  WebkitFontSmoothing: "antialiased",
  WebkitTextSizeAdjust: "100%",
  textSizeAdjust: "100%"
})

globalStyle("body", {
  letterSpacing: letterSpacings.size3,
  lineHeight: 1.5,
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

globalStyle("p", {
  fontSize: fontSizes.size4
})

globalStyle("#root", {
  isolation: "isolate"
})
