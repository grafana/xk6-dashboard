// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import "./Brief.css";
import { iterable } from "./util";
import SummarySection from "./Summary";

import { Chart } from "./Chart";

function reportSections(samples, conf) {
  const all = [];

  if (!iterable(conf)) {
    return all;
  }

  for (let i = 0; i < conf.length; i++) {
    if (conf[i].event != "snapshot") {
      continue;
    }

    all.push(<ReportSection {...conf[i]} samples={samples} />);
  }

  return all;
}

function charts(samples, conf) {
  const all = [];

  if (!iterable(conf)) {
    return all;
  }

  for (const chart of conf) {
    let c = { ...chart, metrics: samples };
    all.push(<div className="col">{Chart(c)}</div>);
  }

  return all;
}

function ReportSection(props) {
  return (
    <section className="container">
      <h2 id={props.id ? props.id : props.title}>{props.title}</h2>
      <p>{props.description}</p>
      <div className="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-2">
      {charts(props.samples, props.charts)}
      </div>
    </section>
  );
}

function UsageSection(props) {
  return (
    <section className="usage container">
      <hr/>
      <p className="usage">
      Select a time interval by holding down the mouse on any graph to zoom. To cancel zoom, double click on any graph.
      </p>
    </section>
  );
}

export function Brief(props) {
  return (
    <section className="container brief">
      <h1>k6 report</h1>
      <div>{reportSections(props.data.metrics, props.config.tabs)}</div>
      <SummarySection
        summary={props.data.summary}
        title="Summary"
        description="This section provides a summary of the test run metrics. The tables contains the aggregated values of the metrics for the entire test run."
      />
      <UsageSection/>
    </section>
  );
}
