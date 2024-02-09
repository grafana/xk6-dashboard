import React from "react"
import { useMediaQuery } from "usehooks-ts"

import { vars } from "theme"
import { useTimeRange } from "store/timeRange"
import { TimeRangeResetButton } from "components/TimeRangeResetButton"

import * as styles from "./Footer.css"

export const Footer = () => {
  const isTablet = useMediaQuery(`(max-width: ${vars.breakpoints.header})`)
  const { timeRange } = useTimeRange()

  if (!timeRange || !isTablet) {
    return null
  }

  return (
    <footer className={styles.footer}>
      <TimeRangeResetButton />
    </footer>
  )
}
