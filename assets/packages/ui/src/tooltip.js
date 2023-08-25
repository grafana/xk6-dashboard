// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

export function tooltipPlugin(opts) {
  let  tooltip;

  function init(u) {
    tooltip = document.createElement("div");
    tooltip.className = "u-tooltip";
    tooltip.style.display = "none";
    u.over.appendChild(tooltip);

    u.over.onmouseleave = () => {
      tooltip.style.display = "none";
    };
  }

  function ready(u) {
    update(u)
  }

  function update(u) {
    const bound = u.over.getBoundingClientRect();
    tooltip.style.display = "block";

    let inner = legend(u);

    if (!inner) {
      tooltip.style.display = "none";
      return;
    }

    tooltip.innerHTML = inner;

    const { left, top } = u.cursor;

    tooltip.innerHTML = inner;

    if (left < bound.width / 2) {
      tooltip.style.left = Math.max(0,left) + "px";
      tooltip.style.right = "unset";
    } else {
      tooltip.style.right = Math.max(0,bound.width - left) + "px";
      tooltip.style.left = "unset";
    }

    if (top < bound.height / 2) {
      tooltip.style.top = Math.max(0,top) + "px";
      tooltip.style.bottom = "unset";
    } else {
      tooltip.style.bottom = Math.max(0, bound.height - top) + "px";
      tooltip.style.top = "unset";
    }
  }

  return {
    hooks: {
      init,
      ready,
      setCursor: update,
      setData: (u) => u.over.focus(),
    },
  };
}

function legend(u) {
  const { idx } = u.cursor;

  if (idx == undefined) {
    return "";
  }

  let caption = u.legend.values[0]._;

  let buff = `<table><caption style="white-space: nowrap;">${caption}</caption><tbody>`;
  for (var i = 1; i < u.series.length; i++) {
    let stroke = u.legend.markers.stroke(u, i);
    let fill = u.legend.markers.fill(u, i);
    let label = u.series[i].label;
    let value = u.legend.values[i]._;

    buff += `<tr><td>${box(
      stroke,
      fill
    )}</td><td>${label}</td><td style="text-align: right;">${value}</td></tr>`;
  }

  buff += `</tbody></table>`;

  return buff;
}

function box(stroke, fill) {
  return `<svg width="0.8rem" height="0.8rem"><rect width="0.8rem" height="0.8rem" style="fill:${fill};stroke-width:3;stroke:${stroke}" /></svg>`;
}
