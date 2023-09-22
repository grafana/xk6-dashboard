// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { PropTypes } from "prop-types"
import Section from "./Section"

export default function Tab({ tab }) {
  return (
    <>
      {tab.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </>
  )
}

Tab.propTypes = {
  tab: PropTypes.any.isRequired
}
