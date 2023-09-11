// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import handlebars from "vite-plugin-handlebars";
import testcontext from "./.testcontext";

export default defineConfig({
  plugins: [preact(), viteSingleFile(), handlebars({ context: testcontext })],
  build: {
    // outDir: '../../brief'
  },
});
