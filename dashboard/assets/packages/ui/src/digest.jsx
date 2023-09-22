import React, { useEffect, useState } from "react"

import defaultConfig from "@xk6-dashboard/config"

import { Digest, Config, EventType } from "@xk6-dashboard/model"

const DigestContext = React.createContext(() => new Digest({ config: defaultConfig }))
DigestContext.displayName = "Digest"

function DigestProvider({ endpoint = "/events", children }) {
  const [source, setSource] = useState(null)
  const [digest, setDigest] = useState(new Digest({ config: new Config(defaultConfig) }))

  useEffect(() => {
    if (source == null) {
      const source = new EventSource(endpoint)

      const listener = (e) => {
        digest.handleEvent(e)
        setDigest(new Digest(digest))
      }

      for (const type in EventType) {
        source.addEventListener(type, listener)
      }

      setSource(source)
    }
  }, [])

  return <DigestContext.Provider value={() => digest}>{children}</DigestContext.Provider>
}

function useDigest() {
  const context = React.useContext(DigestContext)
  if (context === undefined) {
    throw new Error("useDigest must be used within a DigestProvider")
  }

  return context()
}

export { DigestProvider, useDigest }
