// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import defaultConfig from "@xk6-dashboard/config"
import { Digest, Config, EventType } from "@xk6-dashboard/model"

const DigestContext = createContext(() => new Digest({ config: defaultConfig } as Digest))
DigestContext.displayName = "Digest"

interface DigestProviderProps {
  children: ReactNode
  endpoint: string
}

function DigestProvider({ endpoint = "/events", children }: DigestProviderProps) {
  const [digest, setDigest] = useState(new Digest({ config: new Config(defaultConfig) }))

  useEffect(() => {
    const source = new EventSource(endpoint)

    const listener = (event: MessageEvent) => {
      digest.handleEvent(event)
      setDigest(new Digest(digest))
    }

    for (const type in EventType) {
      source.addEventListener(type, listener)
    }
  }, [])

  return <DigestContext.Provider value={() => digest}>{children}</DigestContext.Provider>
}

function useDigest() {
  const context = useContext(DigestContext)

  if (context === undefined) {
    throw new Error("useDigest must be used within a DigestProvider")
  }

  return context()
}

export { DigestProvider, useDigest }
