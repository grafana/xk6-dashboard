// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import fs from "fs"
import path from "path"
import config from "./src/config.js"

// eslint-disable-next-line no-undef
const file = process.argv[2]
console.log(file)

const dir = path.dirname(file)
console.log(dir)

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

fs.writeFileSync(file, JSON.stringify(config))
