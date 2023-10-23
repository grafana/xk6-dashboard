// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Digest } from "@xk6-dashboard/model"

const getTimestamp = (date?: Date) => {
  return date && new Date(date).getTime()
}

const addMilliseconds = (date: Date | undefined, ms: number) => {
  return date && new Date(date.getTime() + ms)
}

const getTimePercentage = (start: Date | undefined, stop: Date | undefined, now: Date) => {
  const startTime = getTimestamp(start) || 0
  const endTime = getTimestamp(stop) || 0

  const progress = now.getTime() - startTime
  const totalTime = endTime - startTime
  const percentage = (progress / totalTime) * 100

  return percentage
}

export const getTestPercentage = (digest: Digest, now: Date) => {
  if (digest.stop) {
    return 100
  }

  const period = digest.param.endOffset as number
  const endDate = addMilliseconds(digest.start, period)
  const percentage = getTimePercentage(digest.start, endDate, now)

  return Math.round(percentage)
}
