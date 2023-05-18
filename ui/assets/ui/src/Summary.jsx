// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';

import './Summary.css'
import { Grid } from '@mui/material'

import { SummaryContext, useSummary } from './summary';
import { Digest } from './Digest';

export default function SummaryTab(props) {
  return (
    <>
      <div className="Summary">
        <SummaryContext.Provider key={"summary"} value={useSummary()}>
          <Grid container spacing={3} columns={12}>
            <Grid key={"trends"} item xs={12}><Digest type="trend" caption="Trends" /></Grid>
            <Grid key={"counters"} item xs={7}><Digest type="counter" caption="Counters" /></Grid>
            <Grid item xs={5}>
              <Grid container spacing={3} columns={1}>
                <Grid key={"rates"} item xs={1}><Digest type="rate" caption="Rates" /></Grid>
                <Grid key={"gauges"} item xs={1}><Digest type="gauge" caption="Gauges" /></Grid>
              </Grid>
            </Grid>
          </Grid>
        </SummaryContext.Provider>
      </div>
    </>
  )
}

