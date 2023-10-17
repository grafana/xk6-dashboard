// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from "react"
import ReactDOM from "react-dom/client"

import { DigestProvider } from "store/digest"
import App from "components/App"
import Themed from "components/Themed/Themed"

const base = new URLSearchParams(window.location.search).get("endpoint") || "http://localhost:5665/"
const rootElement = document.getElementById("root") as HTMLDivElement

ReactDOM.createRoot(rootElement).render(
  <Themed>
    <DigestProvider endpoint={base + "events"}>
      <App />
    </DigestProvider>
  </Themed>
)
