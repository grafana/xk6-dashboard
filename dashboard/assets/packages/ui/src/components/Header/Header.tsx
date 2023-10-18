// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import type { UIConfig } from "types/config"
import { useTheme } from "store/theme"
import { Button } from "components/Button"
import { Flex } from "components/Flex"
import { ReactComponent as DarkModeIcon } from "assets/icons/dark_mode.svg"
import { ReactComponent as LightModeIcon } from "assets/icons/light_mode.svg"

import * as styles from "./Header.css"

interface HeaderProps {
  config: UIConfig
}

export function Header({ config }: HeaderProps) {
  const { title } = config
  const { theme, setTheme } = useTheme()

  function handleThemeChange() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className={styles.container}>
      <Flex align="center" justify="space-between">
        <h1 className={styles.title}>{title}</h1>
        <Flex align="center">
          <Button onClick={() => window.open("../report", "k6-report")}>Report</Button>
          <Button onClick={handleThemeChange}>{theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}</Button>
        </Flex>
      </Flex>
    </div>
  )
}
