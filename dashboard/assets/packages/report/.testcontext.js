// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs"
import { gunzipSync, gzipSync } from "zlib"

import config from "../config/dist/config.json"
import custom from "../../../../.dashboard.js"

let testdata = ""

if (process.env.NODE_ENV != "production") {
  let data = readFileSync(".testdata.ndjson.gz")
  let text = gunzipSync(Buffer.from(data, "base64")).toString("utf8")

  let conf = { event: "config", data: custom(config) }

  testdata = gzipSync(JSON.stringify(conf) + "\n" + text).toString("base64")
}

export default { testdata }
