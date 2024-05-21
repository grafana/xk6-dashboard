import React from "react"

import { useTimeRange } from "store/timeRange"
import { Button } from "components/Button"
import { Flex } from "components/Flex"
import { Icon } from "components/Icon"

export const TimeRangeResetButton = () => {
  const { timeRange, setTimeRange } = useTimeRange()

  if (!timeRange) {
    return null
  }

  return (
    <Button variant="outline" onClick={() => setTimeRange(undefined)}>
      <Flex align="center" gap={2}>
        <Icon name="rewind-time" />
        <span>Reset</span>
      </Flex>
    </Button>
  )
}
