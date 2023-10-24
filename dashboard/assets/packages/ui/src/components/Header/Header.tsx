// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import type { UIConfig } from "types/config"
import { useDigest } from "store/digest"
import { useTheme } from "store/theme"
import { Button } from "components/Button"
import { Divider } from "components/Divider"
import { Flex } from "components/Flex"
import { Icon } from "components/Icon"
import { Menu } from "components/Menu"
import { Nav } from "components/Nav"
import { Progress } from "components/Progress"

import { getTestPercentage } from "./Header.utils"
import * as styles from "./Header.css"

interface HeaderProps {
  config: UIConfig
  tab: number
  onTabChange: (idx: number) => void
}

export function Header({ config, tab, onTabChange }: HeaderProps) {
  const digest = useDigest()
  const { theme, setTheme } = useTheme()

  const percentage = !digest.stop && getTestPercentage(digest, new Date())

  function handleHelpClick() {
    window.open("https://github.com/grafana/xk6-dashboard", "_blank")
  }

  function handleThemeChange() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <>
      <header className={styles.header}>
        <Flex className={styles.content} align="center" justify="space-between">
          <Flex align="center">
            <Icon name="logo" />
            <Nav options={config.tabs} value={tab} onChange={onTabChange} />
          </Flex>
          <Flex align="center">
            <Button onClick={() => window.open("../report", "k6-report")}>Report</Button>
            <Menu>
              <Menu.Item onClick={handleHelpClick}>
                <Icon name="question" />
                <span>Help</span>
              </Menu.Item>
              <Menu.Item onClick={handleThemeChange}>
                <Icon name={theme === "dark" ? "sun" : "moon"} />
                <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
              </Menu.Item>
            </Menu>
          </Flex>
        </Flex>

        {percentage ? <Progress value={percentage} /> : <Divider className={styles.divider} />}
        <Nav isMobile options={config.tabs} value={tab} onChange={onTabChange} />
      </header>
    </>
  )
}
