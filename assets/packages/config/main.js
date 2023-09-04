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
