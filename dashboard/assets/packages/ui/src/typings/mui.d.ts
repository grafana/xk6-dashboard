// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import "@mui/material"
import { VectorAttrs } from "types/theme"

declare module "@mui/material/styles" {
  interface Palette {
    color: VectorAttrs[]
  }

  interface PaletteOptions {
    color?: VectorAttrs[]
  }
}
