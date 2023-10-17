// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState } from "react"

import { isEmptySection, Section as SectionClass } from "@xk6-dashboard/view"

import { useDigest } from "store/digest"
import { Collapse, Flex, Grid } from "components"

import Panel from "../Panel"
import * as styles from "./Section.css"

interface SectionBodyProps {
  section: SectionClass
}

function SectionBody({ section }: SectionBodyProps) {
  return (
    <Grid style={{ width: "100%" }}>
      {section.panels.map((panel) => {
        return <Panel key={panel.id} panel={panel} />
      })}
    </Grid>
  )
}

interface SectionProps {
  section: SectionClass
}

export function Section({ section }: SectionProps) {
  const [open, setOpen] = useState(true)
  const digest = useDigest()
  const empty = isEmptySection(section, digest)

  if (empty) {
    return <></>
  }

  if (!section.title) {
    return (
      <Flex direction="column" width="100%">
        {section.summary && <p>{section.summary}</p>}
        <SectionBody section={section} />
      </Flex>
    )
  }

  return (
    <Flex direction="column">
      <Collapse title={section.title} isOpen={open} onClick={() => setOpen(!open)}>
        {section.summary && <p className={styles.summary}>{section.summary}</p>}
        <SectionBody section={section} />
      </Collapse>
    </Flex>
  )
}
