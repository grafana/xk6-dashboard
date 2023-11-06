// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import svgr from "vite-plugin-svgr"
import preact from "@preact/preset-vite"
import handlebars from "vite-plugin-handlebars"
import tsconfigPaths from "vite-tsconfig-paths"
import { visualizer } from "rollup-plugin-visualizer"

import testcontext from "./.testcontext"

export default defineConfig({
  plugins: [
    preact(),
    svgr(),
    viteSingleFile(),
    tsconfigPaths(),
    vanillaExtractPlugin(),
    handlebars({ context: testcontext }),
    visualizer({
      filename: "bundle-stats.html"
    })
  ]
})
