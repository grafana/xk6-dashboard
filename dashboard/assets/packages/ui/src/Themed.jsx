import React from "react"
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material"
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} from "@mui/material/colors"
import { PropTypes } from "prop-types"
import "./index.css"

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const colors = {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
}

const order = [
  "grey",
  "teal",
  "blue",
  "purple",
  "indigo",
  "orange",
  "pink",
  "green",
  "cyan",
  "amber",
  "lime",
  "brown",
  "lightGreen",
  "red",
  "deepPurple",
  "lightBlue",
  "yellow",
  "deepOrange",
  "blueGrey"
]

export default function Themed({ children }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [mode, setMode] = React.useState(prefersDarkMode ? "dark" : "light")

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
      }
    }),
    []
  )

  const theme = React.useMemo(() => {
    let extra = []

    for (var i = 0; i < order.length; i++) {
      const name = order[i]
      const color = {
        stroke: mode == "dark" ? colors[name][500] : colors[name][800],
        fill: (mode == "dark" ? colors[name][300] : colors[name][600]) + "20"
      }
      colors[name].stroke = mode ? "dark" : colors[name][500]
      extra.push(color)
      extra[name] = color
    }

    let theme = createTheme({
      palette: {
        mode,
        primary: {
          main: "#7b65fa"
        },
        secondary: {
          main: "#A47D4F"
        },
        color: extra
      }
    })

    return createTheme(theme, {
      palette: {
        mode
      }
    })
  }, [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

Themed.propTypes = {
  children: PropTypes.node
}
