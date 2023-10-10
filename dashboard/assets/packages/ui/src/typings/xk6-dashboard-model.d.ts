import "@xk6-dashboard/model"

import { DigestConfig } from "types/config"

declare module "@xk6-dashboard/model" {
  interface Config extends DigestConfig {}

  interface Digest {
    config?: DigestConfig
  }
}
