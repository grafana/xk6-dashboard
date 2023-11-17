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

import { getDuration, getRefreshRate, getTestPercentage } from "./Header.utils"
import * as styles from "./Header.css"
import { Tooltip } from "components/Tooltip"

interface HeaderProps {
  config: UIConfig
  tab: number
  onTabChange: (idx: number) => void
}

export function Header({ config, tab, onTabChange }: HeaderProps) {
  const digest = useDigest()
  const percentage = !digest.stop && getTestPercentage(digest, new Date())

  return (
    <>
      <header className={styles.header}>
        <Flex className={styles.content} align="center" justify="space-between">
          <Flex align="center" gap={4}>
            <Icon name="logo" />
            <Nav options={config.tabs} value={tab} onChange={onTabChange} />
          </Flex>
          <Flex align="center">
            <Stats />
            <Button onClick={() => window.open("../report", "k6-report")}>Report</Button>
            <Options />
          </Flex>
        </Flex>

        {percentage ? <Progress value={percentage} /> : <Divider className={styles.divider} />}
        <Nav isMobile options={config.tabs} value={tab} onChange={onTabChange} />
      </header>
    </>
  )
}

const Stats = () => {
  const digest = useDigest()

  return (
    <div className={styles.stats}>
      <Flex align="center" gap={3}>
        <Tooltip placement="bottom" title="Refresh rate">
          <Flex align="center" gap={2}>
            <Icon name="stop-watch" width="12px" height="12px" />
            <span>{getRefreshRate(digest)}</span>
          </Flex>
        </Tooltip>
        <Tooltip placement="bottom" title="Duration">
          <Flex align="center" gap={2}>
            <Icon name="hour-glass" width="12px" height="12px" />
            <span>{getDuration(digest)}</span>
          </Flex>
        </Tooltip>
      </Flex>
    </div>
  )
}

const Options = () => {
  const { theme, setTheme } = useTheme()

  function handleHelpClick() {
    window.open("https://github.com/grafana/xk6-dashboard", "_blank")
  }

  function handleThemeChange() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
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
  )
}
