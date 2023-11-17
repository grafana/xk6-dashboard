// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Digest } from "@xk6-dashboard/model"

const getTimestamp = (date?: Date) => {
  return date && new Date(date).getTime()
}

export const addMilliseconds = (date: Date | undefined, ms: number) => {
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

const timeFormatter = (timeInSeconds = 0) => {
  const totalSeconds = Math.round(timeInSeconds)
  const seconds = Math.round(totalSeconds % 60)

  if (totalSeconds < 0) {
    return "-"
  }

  if (totalSeconds < 60) {
    return `${totalSeconds}s`
  }

  if (seconds > 0) {
    const minutes = Math.round((timeInSeconds - seconds) / 60)

    return `${minutes}min ${seconds}s`
  }

  return `${Math.round(totalSeconds / 60)}min`
}

export const getRefreshRate = (digest: Digest) => {
  const period = (digest.param.period || 0) as number

  return timeFormatter(period / 1000)
}

export const getDuration = (digest: Digest) => {
  const start = digest.start
  const endOffset = (digest.param.endOffset || 0) as number
  const end = digest.stop || addMilliseconds(digest.start, endOffset)

  if (!start || !end) {
    return
  }

  return timeFormatter((end.getTime() - start.getTime()) / 1000)
}
