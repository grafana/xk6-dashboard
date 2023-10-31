// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import svgr from "vite-plugin-svgr"
import { visualizer } from "rollup-plugin-visualizer"
import tsconfigPaths from "vite-tsconfig-paths"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"

export default defineConfig({
  plugins: [
    svgr(),
    react(),
    tsconfigPaths(),
    vanillaExtractPlugin(),
    visualizer({
      filename: "bundle-stats.html"
    })
  ],
  build: { chunkSizeWarningLimit: 512 /*, outDir: '../../ui'*/ },
  base: ""
})
