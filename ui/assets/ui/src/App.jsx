// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';
import './App.css'
import { MetricsContext, useEvent } from './metrics';
import { Grid, AppBar, Typography, Tabs, Tab, Box } from '@mui/material'
import { PropTypes } from 'prop-types';

import { Panel } from './Panel';
import { Chart } from './Chart';

function iterable(input) {  
  if (input === null || input === undefined) {
    return false
  }

  return typeof input[Symbol.iterator] === 'function'
}

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

function tabContents(conf, value) {
  const all = []

  if (!iterable(conf)) {
    return all
  }

  for (let i = 0; i < conf.length; i++) {
    all.push(
      <MetricsContext.Provider key={i} value={useEvent(conf[i].event)}>
        <TabContent value={value} index={i}>
          <ContentPanel panels={conf[i].panels} charts={conf[i].charts} />
        </TabContent>
      </MetricsContext.Provider>
    )
  }

  return all
}

function tabs(conf) {
  const all = []

  if (!iterable(conf)) {
    return all
  }

  for (let i = 0; i < conf.length; i++) {
    all.push(
      <Tab key={i} label={conf[i].title} {...a11yProps(i)} />
    )
  }

  return all
}

function App(props) {
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <div className="App">
      <AppBar position="sticky">
        <Typography variant="h6" component="div" align="center" sx={{ flexGrow: 1 }}>{props.title}</Typography>
      </AppBar>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          {tabs(props.tabs)}
        </Tabs>
      </Box>
      {tabContents(props.tabs, value)}
    </div>
  )
}

export default App
