import React from "react"
import { PropTypes } from "prop-types"

import Chart from "./Chart"
import Stat from "./Stat"

export default function Panel({ panel }) {
  if (panel.kind == "chart") {
    return <Chart panel={panel} />
  }
  if (panel.kind == "stat") {
    return <Stat panel={panel} />
  }
}

Panel.propTypes = {
  panel: PropTypes.any.isRequired
}
