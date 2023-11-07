// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { globalStyle } from "@vanilla-extract/css"

import { fontSizes, fonts, letterSpacings, lineHeights } from "./typography.css"
import { grey } from "theme/colors.css"

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
  color: grey["700"],
  letterSpacing: letterSpacings.size3,
  lineHeight: lineHeights.size3,
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

globalStyle("h1, h2, h3, h4, h5, h6", {
  color: grey["800"],
  overflowWrap: "break-word"
})

globalStyle("h1", {
  fontSize: fontSizes.size10
})

globalStyle("h2", {
  fontSize: fontSizes.size9
})

globalStyle("h3", {
  fontSize: fontSizes.size7
})

globalStyle("h4", {
  fontSize: fontSizes.size6
})

globalStyle("p", {
  fontSize: fontSizes.size5
})

globalStyle("#root", {
  isolation: "isolate"
})
