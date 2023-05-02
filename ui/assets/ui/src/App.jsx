// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from 'react';
import './App.css'
import { DurationChart, IterationChart, LoadChart, TransferChart } from './Charts';
import { VusPanel, IterationPanel, RequestPanel, DurationPanel, DataReceivedPanel, DataSentPanel } from './Panels'
import { MetricsContext, useSnapshot, useCumulative } from './metrics';
import { Grid, AppBar, Typography, Tabs, Tab, Box } from '@mui/material'
import { PropTypes } from 'prop-types';

function ContentPanel() {
  return (
    <>
      <Box>
        <Grid container spacing={1} marginBottom={1} columns={6}>
          <Grid item xs={1} ><IterationPanel /></Grid>
          <Grid item xs={1} ><VusPanel /></Grid>
          <Grid item xs={1} ><RequestPanel /></Grid>
          <Grid item xs={1} ><DurationPanel /></Grid>
          <Grid item xs={1} ><DataReceivedPanel /></Grid>
          <Grid item xs={1} ><DataSentPanel /></Grid>
        </Grid>
      </Box>
      <Grid container spacing={1}>
        <Grid item lg={6} xs={12} ><LoadChart /></Grid>
        <Grid item lg={6} xs={12}><TransferChart /></Grid>
        <Grid item lg={6} xs={12}><DurationChart /></Grid>
        <Grid item lg={6} xs={12}><IterationChart /></Grid>
      </Grid>
    </>
  )
}


function TabPanel(props) {
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

TabPanel.propTypes = {
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

function App() {
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <div className="App">
      <AppBar position="sticky">
        <Typography variant="h6" component="div" align="center" sx={{ flexGrow: 1 }}>k6 dashboard</Typography>
      </AppBar>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Snapshot" {...a11yProps(0)} />
          <Tab label="Cumulative" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <MetricsContext.Provider value={useSnapshot()}>
        <TabPanel value={value} index={0}>
          <ContentPanel />
        </TabPanel>
      </MetricsContext.Provider>
      <MetricsContext.Provider value={useCumulative()}>
        <TabPanel value={value} index={1}>
          <ContentPanel />
        </TabPanel>
      </MetricsContext.Provider>
    </div>
  )
}

export default App
