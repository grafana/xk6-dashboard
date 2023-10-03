// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import Themed from "./Themed"
import { DigestProvider } from "./digest"

const base = new URLSearchParams(window.location.search).get("endpoint") || "http://localhost:5665/"

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    {/*<React.StrictMode>*/}
    <Themed>
      <DigestProvider endpoint={base + "events"}>
        <App />
      </DigestProvider>
    </Themed>
    {/*</React.StrictMode>*/}
  </>
)
