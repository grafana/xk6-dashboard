// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState } from "react"
import { Box, Collapse, Typography, Grid } from "@mui/material"
import { isEmptySection } from "@xk6-dashboard/view"

import { useDigest } from "store/digest"
import { ReactComponent as ExpandLessIcon } from "assets/icons/expand_less.svg"
import { ReactComponent as ExpandMoreIcon } from "assets/icons/expand_more.svg"

import Panel from "./Panel"

interface SectionBodyProps {
  section: any
}

function SectionBody({ section }: SectionBodyProps) {
  return (
    <Grid container spacing={1} columns={12}>
      {section.panels.map((panel) => {
        return <Panel key={panel.id} panel={panel} />
      })}
    </Grid>
  )
}

interface SectionProps {
  section: any
}

export default function Section({ section }: SectionProps) {
  const [open, setOpen] = useState(true)
  const digest = useDigest()
  const empty = isEmptySection(section, digest)

  if (empty) {
    return <></>
  }

  if (!section.title) {
    return (
      <Box className="section" sx={{ border: "1px dotted #80808040", marginBottom: "1rem" }}>
        <Typography variant="h6">{section.title}</Typography>
        <Typography>{section.summary}</Typography>
        <SectionBody section={section} />
      </Box>
    )
  }

  return (
    <Box className="section" sx={{ border: "1px dotted #80808080", marginBottom: "1rem" }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} sx={{ "&:hover": { cursor: "pointer", opacity: 0.5 } }}>
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        {section.title}
      </Typography>
      <Collapse in={open}>
        {open ? <Typography>{section.summary}</Typography> : <></>}
        <SectionBody section={section} />
      </Collapse>
    </Box>
  )
}
