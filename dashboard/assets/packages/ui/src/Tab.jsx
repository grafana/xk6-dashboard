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
