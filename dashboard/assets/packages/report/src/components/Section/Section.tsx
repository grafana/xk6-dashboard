// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React from "react"
import { Digest } from "@xk6-dashboard/model"
import { Section as SectionClass, isEmptySection, PanelKind } from "@xk6-dashboard/view"

import { ReactComponent as CircleIcon } from "assets/icons/circle.svg"
import { Flex } from "components/Flex"
import { Grid } from "components/Grid"
import { Panel } from "components/Panel"

import { getColumnSizes } from "./Section.utils"
import * as styles from "./Section.css"
import { vars } from "theme"

interface SectionProps {
  section: SectionClass
  digest: Digest
}

export function Section({ section, digest }: SectionProps) {
  const isEmpty = isEmptySection(section, digest)
  const panelsExcludingStats = section.panels.filter((panel) => panel.kind !== PanelKind.stat)

  if (isEmpty || !panelsExcludingStats.length) {
    return null
  }

  return (
    <section>
      {section.title && (
        <Flex className={styles.header} align="baseline" gap={2}>
          <CircleIcon className={styles.icon} color={vars.colors.primary.dark} width="15px" height="15px" />
          <Flex direction="column">
            <h3>{section.title}</h3>
            <p>{section.summary}</p>
          </Flex>
        </Flex>
      )}

      <div className={styles.panel}>
        <Grid key={section.id + "row"} gap={4}>
          {panelsExcludingStats.map((panel) => (
            <Grid.Column key={panel.id + "col"} {...getColumnSizes(panel, digest)}>
              <Panel key={panel.id} panel={panel} digest={digest} />
            </Grid.Column>
          ))}
        </Grid>
      </div>
    </section>
  )
}
