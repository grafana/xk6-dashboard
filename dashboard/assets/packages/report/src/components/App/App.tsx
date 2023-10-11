// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from "react"
import { Digest } from "@xk6-dashboard/model"

import Tab from "components/Tab"
import "./App.css"

interface AppProps {
  digest: Digest
}

export default function App({ digest }: AppProps) {
  return (
    <article className="container-fluid report">
      <h1>k6 report</h1>

      {digest.config.tabs.map((tab) => (
        <Tab tab={tab} digest={digest} key={tab.id} />
      ))}
      <section className="usage">
        <hr />
        <p className="usage">
          Select a time interval by holding down the mouse on any graph to zoom. To cancel zoom, double click on any graph.
        </p>
      </section>
    </article>
  )
}
