// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import uPlot from "uplot"

export function tooltipPlugin(background: string) {
  let tooltip: HTMLElement

  function init(u: uPlot) {
    tooltip = document.createElement("div")

    const style: Record<string, string> = {
      display: "none",
      position: "absolute",
      padding: "1rem",
      border: "1px solid #7b65fa",
      zIndex: "10",
      pointerEvents: "none",
      fontSize: "1.25rem"
    }

    Object.assign(tooltip.style, style)
    u.over.appendChild(tooltip)

    u.over.onmouseleave = () => {
      tooltip.style.display = "none"
    }

    u.over.onmouseenter = () => {
      tooltip.style.display = "block"
    }
  }

  function ready(u: uPlot) {
    update(u)
  }

  function update(u: uPlot) {
    const bound = u.over.getBoundingClientRect()
    //tooltip.style.display = "block"
    tooltip.style.background = background

    const inner: string = legend(u)

    if (!inner) {
      tooltip.style.display = "none"
      return
    }

    tooltip.innerHTML = inner

    const { left: leftVal, top: topVal } = u.cursor

    const left = leftVal ?? 0
    const top = topVal ?? 0

    tooltip.innerHTML = inner

    if (left < bound.width / 2) {
      tooltip.style.left = Math.max(0, left) + "px"
      tooltip.style.right = "unset"
    } else {
      tooltip.style.right = Math.max(0, bound.width - left) + "px"
      tooltip.style.left = "unset"
    }

    if (top < bound.height / 2) {
      tooltip.style.top = Math.max(0, top) + "px"
      tooltip.style.bottom = "unset"
    } else {
      tooltip.style.bottom = Math.max(0, bound.height - top) + "px"
      tooltip.style.top = "unset"
    }
  }

  return {
    hooks: {
      init,
      ready,
      setCursor: update,
      setData: (u: uPlot) => u.over.focus()
    }
  }
}

function legend(u: uPlot): string {
  const { idx } = u.cursor

  if (idx == undefined) {
    return ""
  }

  let caption: string | number

  if (u.legend.values) {
    caption = u.legend.values[0]._
  } else {
    caption = ""
  }

  let buff = `<table><caption style="white-space: nowrap;caption-side:top;background-color: unset;border:unset;">${caption}</caption><tbody>`
  for (let i = 1; i < u.series.length; i++) {
    let stroke: string = ""
    let fill: string = ""

    if (u.legend.markers != undefined) {
      let fnOrStr = u.legend.markers.stroke != undefined ? u.legend.markers.stroke : ""
      stroke = typeof fnOrStr == "string" ? fnOrStr : fnOrStr(u, i)
      fnOrStr = u.legend.markers.fill != undefined ? u.legend.markers.fill : ""
      fill = typeof fnOrStr == "string" ? fnOrStr : fnOrStr(u, i)
    }

    const legend = u.series[i].label ?? ""
    const value = u.legend.values ? u.legend.values[i]._ : ""

    buff += `<tr><td style="text-align: left;padding: 0.1rem;">${box(
      stroke,
      fill
    )}</td><td style="text-align: left;padding: 0.1rem;">${legend}</td><td style="text-align: right;">${value}</td></tr>`
  }

  buff += `</tbody></table>`

  return buff
}

function box(stroke: string, fill: string): string {
  return `<svg width="0.8rem" height="0.8rem"><rect width="0.8rem" height="0.8rem" style="fill:${fill};stroke-width:3;stroke:${stroke}" /></svg>`
}
