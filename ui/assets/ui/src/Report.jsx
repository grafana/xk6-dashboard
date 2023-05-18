// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';

import './Report.css'

import { MetricsContext, useEvent } from './metrics';
import { SummaryContext, useSummary } from './summary';
import { Grid, Fab, Typography, Box } from '@mui/material'
import { ReactComponent as PrintIcon } from './icons/print.svg'

import { Digest } from './Digest';

import { Chart } from './Chart';
import { iterable } from './util';

function reportSections(conf) {
  const all = []

  if (!iterable(conf)) {
    return all
  }

  let ctx = { snapshot: useEvent('snapshot'), cumulative: useEvent('cumulative') }

  for (let i = 0; i < conf.length; i++) {
    if (conf[i].event != 'snapshot') {
      continue
    }

    all.push(
      <MetricsContext.Provider key={i} value={ctx[conf[i].event]}>
        <ReportSection {...conf[i]} />
      </MetricsContext.Provider>
    )
  }

  return all
}

function charts(conf) {
  const all = []

  if (!iterable(conf)) {
    return all
  }

  for (const chart of conf) {
    let c = { ...chart, width: 480, height: 240, plain: true }
    all.push(
      <Grid key={"report" + chart.title} item xs={1}>{Chart(c)}</Grid>
    )
  }

  return all
}

function ReportSection(props) {
  return (
    <>
      <Typography variant="h5" component="h2" align="center" sx={{ paddingBottom: '1em', paddingTop: '0.5em' }}>{props.title}</Typography>
      <Typography paragraph sx={{ marginLeft: '2em', marginRight: '2em' }}>{props.description}</Typography>
      <Grid container spacing={3} columns={2}>
        {charts(props.charts)}
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
        <SummaryContext.Provider key={"summary"} value={useSummary()}>
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
        </SummaryContext.Provider>
      </Box>
    </>
  )
}


function Report(props) {
  return (
    <>
      <Box className='FabBox' sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab color="primary" aria-label="Print" size="small" onClick={window.print}><PrintIcon /></Fab>
      </Box>
      <div className="Report">
        <Typography className="PageHeader" component="div">k6 report</Typography>

        {reportSections(props.tabs)}
        <SummarySection title="Summary" description="This section provides a summary of the test run metrics. The tables contains the aggregated values of the metrics for the entire test run." />
      </div>
    </>
  )
}

export default Report
