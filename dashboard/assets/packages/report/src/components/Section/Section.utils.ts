import { Digest } from "@xk6-dashboard/model"
import { Panel as PanelClass, SummaryTable } from "@xk6-dashboard/view"

export const getColumnSizes = (panel: PanelClass, digest: Digest) => {
  if (panel.kind == "chart") {
    return { xs: 12, lg: 6 }
  }

  if (panel.kind == "summary") {
    const table = new SummaryTable(panel, digest)
    const num = table.view.aggregates.length
    const lg = num > 6 ? 12 : num > 1 ? 6 : 3
    const md = num > 6 ? 12 : num > 1 ? 12 : 6

    return { xs: 12, md, lg }
  }

  return {}
}
