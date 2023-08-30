// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';
import './Dashboard.css'
import { useMetricEvent } from './metrics';
import { SamplesContext, useEvent } from './samples';
import { useConfig } from './config';
import { Grid, Typography, Tabs, Tab, Box } from '@mui/material'
import { PropTypes } from 'prop-types';
import { SummaryContext, useSummary } from './summary';

import Header from './Header'
import Report from './Report'
import Summary from './Summary'

import { Panel } from './Panel';
import { Chart } from './Chart';
import { iterable } from './util';

function panels(conf) {
  const all = []

  if (!iterable(conf)) {
    return all
  }

  for (const panel of conf) {
    all.push(
      <Grid key={panel.title} item xs={1}>{Panel(panel)}</Grid>
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
    all.push(
      <Grid key={chart.title} item lg={6} xs={12}>{Chart(chart)}</Grid>
    )
  }

  return all
}

function ContentPanel(props) {
  return (
    <>
      <Box>
        <Grid container spacing={1} marginBottom={1} columns={6}>
          {panels(props.panels)}
        </Grid>
      </Box>
      <Grid container spacing={1}>
        {charts(props.charts)}
      </Grid>
    </>
  )
}


function TabContent(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabContent.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`
  };
}

function tabContents(conf, value, metricsHook) {
  const all = []

  if (!iterable(conf())) {
    return all
  }

  let ctx = { snapshot: useEvent('snapshot', metricsHook), cumulative: useEvent('cumulative', metricsHook) }

  for (let i = 0; i < conf().length; i++) {
    all.push(
      <SamplesContext.Provider key={i} value={ctx[conf()[i].event]}>
        <TabContent value={value} index={i}>
          <ContentPanel panels={conf()[i].panels} charts={conf()[i].charts} />
        </TabContent>
      </SamplesContext.Provider>
    )
  }

  let idx = conf().length

  all.push(
    <TabContent key={idx} value={value} index={idx}>
      <SummaryContext.Provider key="summary_tab" value={useSummary(metricsHook)}>
        <Summary conf={conf} />
      </SummaryContext.Provider>

    </TabContent>
  )

  idx++

  all.push(
    <TabContent key={idx} value={value} index={idx}>
      <SamplesContext.Provider key={"summary_samples" + idx} value={ctx.snapshot}>
        <SummaryContext.Provider key="report_tab" value={useSummary(metricsHook)}>
          <Report conf={conf} />
        </SummaryContext.Provider>
      </SamplesContext.Provider>

    </TabContent>
  )

  return all
}

function tabs(conf) {
  const all = []

  if (!iterable(conf())) {
    return all
  }

  for (let i = 0; i < conf().length; i++) {
    all.push(
      <Tab key={i} label={conf()[i].title} {...a11yProps(i)} />
    )
  }

  let idx = conf().length

  all.push(
    <Tab key={idx} label={"summary"} {...a11yProps(idx)} />
  )

  idx++

  all.push(
    <Tab key={idx} label={"report"} {...a11yProps(idx)} />
  )

  return all
}

function Dashboard() {
  const [value, setValue] = React.useState(0);
  const config = useConfig()
  const metrics = useMetricEvent()

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <>
      <Header conf={() => config} />
      <div className="Dashboard">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange}>
            {tabs(() => config.tabs)}
          </Tabs>
        </Box>
        {tabContents(() => config.tabs, value, () => metrics)}
      </div>
    </>
  )
}

export default Dashboard
