// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [svgr(),react()],
  build: { chunkSizeWarningLimit: 512, outDir: '../../ui' },
  base: ''
})
