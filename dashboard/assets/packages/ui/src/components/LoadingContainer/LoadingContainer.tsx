// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { type ReactNode } from "react"

import { Flex } from "components/Flex"
import { Icon } from "components/Icon"

import * as styles from "./LoadingContainer.css"

interface LoadingContainerProps {
  children: ReactNode
  message?: string
  isLoading: boolean
}

export function LoadingContainer({ children, message, isLoading }: LoadingContainerProps) {
  if (!isLoading) {
    return children
  }

  return (
    <Flex align="center" justify="center">
      <Icon className={styles.icon} name="spinner" />
      <h2>{message}</h2>
    </Flex>
  )
}
