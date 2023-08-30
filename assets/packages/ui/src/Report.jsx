// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';

import './Report.css'

import { Grid, Fab, Typography, Box } from '@mui/material'
import { ReactComponent as PrintIcon } from './icons/print.svg'
import { ReactComponent as DownloadIcon } from './icons/download.svg'
import { ReactComponent as OpenIcon } from './icons/open.svg'

import { Digest } from './Digest';

import { Chart } from './Chart';
import { iterable } from './util';

function reportSections(conf) {
  const all = []

  if (!iterable(conf())) {
    return all
  }

  for (let i = 0; i < conf().length; i++) {
    if (conf()[i].event != 'snapshot') {
      continue
    }

    all.push(
      <ReportSection key={"report_section" + i} conf={() => conf()[i]} />
    )
  }

  return all
}

function charts(conf) {
  const all = []

  if (!iterable(conf())) {
    return all
  }

  for (const chart of conf()) {
    let c = { ...chart, width: 480, height: 240, plain: true }
    all.push(
      <Grid key={"report" + chart.title} item xs={1}>{Chart(c)}</Grid>
    )
  }

  return all
}

function ReportSection({ conf }) {
  return (
    <>
      <Typography variant="h5" component="h2" align="center" sx={{ paddingBottom: '1em', paddingTop: '0.5em' }}>{conf().title}</Typography>
      <Typography paragraph sx={{ marginLeft: '2em', marginRight: '2em' }}>{conf().description}</Typography>
      <Grid container spacing={3} columns={2}>
        {charts(() => conf().charts)}
      </Grid>
    </>
  )
}

function SummarySection(props) {
  return (
    <>
      <Typography variant="h5" component="h2" align="center" sx={{ paddingBottom: '1em', paddingTop: '0.5em' }}>{props.title}</Typography>
      <Typography paragraph sx={{ marginLeft: '2em', marginRight: '2em' }}>{props.description}</Typography>
      <Box className="Summary" sx={{ marginLeft: '2em', marginRight: '2em' }}>
        <Grid container spacing={3} columns={12}>
          <Grid key={"trends"} item xs={12}><Digest type="trend" plain caption="Trends" /></Grid>
          <Grid key={"counters"} item xs={7}><Digest type="counter" plain caption="Counters" /></Grid>
          <Grid item xs={5}>
            <Grid container spacing={3} columns={1}>
              <Grid key={"rates"} item xs={1}><Digest type="rate" plain caption="Rates" /></Grid>
              <Grid key={"gauges"} item xs={1}><Digest type="gauge" plain caption="Gauges" /></Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}


function Report(props) {
  return (
    <>
      <Box className='FabBox' sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab color="primary" aria-label="Print" size="small" onClick={window.print}><PrintIcon /></Fab>
        <Fab color="primary" aria-label="Download" size="small" download="k6-report.html" href="/report"><DownloadIcon /></Fab>
        <Fab color="primary" aria-label="Open" size="small" onClick={() => window.open("/report")}><OpenIcon /></Fab>
      </Box>
      <div className="Report">
        <Typography className="PageHeader" component="div">k6 report</Typography>
        {reportSections(props.conf)}
        <SummarySection title="Summary" description="This section provides a summary of the test run metrics. The tables contains the aggregated values of the metrics for the entire test run." />
      </div>
    </>
  )
}

export default Report
