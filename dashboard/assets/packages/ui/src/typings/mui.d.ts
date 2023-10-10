import "@mui/material"
import { ColorParams } from "types/theme"

declare module "@mui/material/styles" {
  interface Palette {
    color: ColorParams[]
  }

  interface PaletteOptions {
    color?: ColorParams[]
  }
}
