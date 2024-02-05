// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"

interface TimeRange {
  from?: number
  to?: number
}

interface TimeRangeContextProps {
  timeRange: TimeRange | undefined
  setTimeRange: Dispatch<SetStateAction<TimeRange | undefined>>
}

const TimeRangeContext = createContext<TimeRangeContextProps | undefined>(undefined)

interface TimeRangeProviderProps {
  children: ReactNode
}

function TimeRangeProvider({ children }: TimeRangeProviderProps) {
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>()

  const context = {
    timeRange,
    setTimeRange
  }

  return <TimeRangeContext.Provider value={context}>{children}</TimeRangeContext.Provider>
}

function useTimeRange() {
  const context = useContext(TimeRangeContext)

  if (context === undefined) {
    throw new Error("useTimeRange must be used within a TimeRangeProvider")
  }

  return context as TimeRangeContextProps
}

export { TimeRangeProvider, useTimeRange }
