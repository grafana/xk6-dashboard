// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { viteSingleFile } from "vite-plugin-singlefile"
import handlebars from 'vite-plugin-handlebars';
import testcontext from './.testcontext'

export default defineConfig({
  plugins: [preact(), viteSingleFile(), handlebars({context: testcontext})],
  build: {
    outDir: '../../brief'
  }
})
