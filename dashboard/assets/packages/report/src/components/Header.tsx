// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"

import "theme/global.css"
import { Flex } from "components/Flex"
import { ReactComponent as LogoIcon } from "assets/icons/logo.svg"

export function Header() {
  return (
    <Flex as="header" align="center">
      <LogoIcon />
      <Flex as="h1" grow={1} justify="center">
        Report
      </Flex>
    </Flex>
  )
}
