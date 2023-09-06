// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import "./Summary.css";

import { Digest } from "./Digest";

export default function SummarySection(props) {
  const { summary, title, description } = props;

  return (
    <section id="summary" className="container">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="row">
        <div className="col">
          <Digest summary={summary} type="trend" caption="Trends" />
        </div>
      </div>
      <div className="row">
        <div className="col-7">
          <Digest summary={summary} type="counter" caption="Counters" />
        </div>
        <div className="col-5">
          <div className="row">
            <div className="col">
              <Digest summary={summary} type="rate" caption="Rates" />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <Digest summary={summary} type="gauge" caption="Gauges" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
