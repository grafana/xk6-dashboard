// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"

import "theme/global.css"
import { Flex } from "components/Flex"
import { ReactComponent as LogoIcon } from "assets/icons/logo.svg"

import { toDate } from "./Header.utils"
import * as styles from "./Header.css"

interface HeaderProps {
  digest: Digest
}

export function Header({ digest }: HeaderProps) {
  return (
    <Flex as="header" align="center">
      <LogoIcon />
      <Flex className={styles.heading} as="h1" grow={1} justify="center">
        Report: <span className={styles.date}>{toDate(digest.start)}</span>
      </Flex>
    </Flex>
  )
}
