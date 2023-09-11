// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { gunzipSync, gzipSync } from "zlib";

import config from "../config/dist/config.json";
import custom from "../../../../.dashboard.js";

let testdata = "";

if (process.env.NODE_ENV != "production") {
  let str = gunzipSync(readFileSync(".testdata.json.gz")).toString("utf8");
  let json = JSON.parse(str);
  json.config = custom(config);
  testdata = gzipSync(JSON.stringify(json)).toString("base64");
}

export default { testdata };
