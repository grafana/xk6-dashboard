import { useState } from "react"
import uPlot, { type Options } from "uplot"
import { type SeriesPlot } from "@xk6-dashboard/view"

import { createOptions, CreateOptionsProps } from "./Chart.utils"

export const useOptions = ({ plot, theme, width }: CreateOptionsProps): Options => {
  const [series, setSeries] = useState<object | undefined>(plot.series)

  const newPlot = { ...plot, series } as SeriesPlot
  const options = createOptions({ plot: newPlot, theme, width })
  const hooks = { setSeries: [(self: uPlot) => setSeries(self.series)] }

  return { ...options, hooks }
}
