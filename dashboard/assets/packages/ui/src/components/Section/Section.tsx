// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState } from "react"

import { isEmptySection, Section as SectionClass } from "@xk6-dashboard/view"

import { useDigest } from "store/digest"
import { Collapse } from "components/Collapse"
import { Flex } from "components/Flex"
import { Grid } from "components/Grid"

import Panel from "../Panel"
import * as styles from "./Section.css"

interface SectionBodyProps {
  container?: boolean
  section: SectionClass
}

function SectionBody({ container, section }: SectionBodyProps) {
  return (
    <Grid gap={container ? 4 : 3}>
      {section.panels.map((panel) => (
        <Panel key={panel.id} panel={panel} container={container} />
      ))}
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
    return null
  }

  if (!section.title) {
    return (
      <Flex direction="column">
        {section.summary && <p className={styles.summary}>{section.summary}</p>}
        <SectionBody section={section} />
      </Flex>
    )
  }

  return (
    <Flex direction="column">
      <Collapse title={section.title} isOpen={open} onClick={() => setOpen(!open)}>
        <SectionBody container section={section} />
      </Collapse>
    </Flex>
  )
}
