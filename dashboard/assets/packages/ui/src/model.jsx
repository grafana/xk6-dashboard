// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useEffect, useState } from "react"

import { Model, Config } from "@xk6-dashboard/model"
import defaultConfig from "@xk6-dashboard/config"

const ModelContext = React.createContext(() => new Model({ config: defaultConfig }))
ModelContext.displayName = "Model"

function ModelProvider({ endpoint = "/events", children }) {
  const [source, setSource] = useState(null)
  const [model, setModel] = useState(new Model({ config: new Config(defaultConfig) }))

  useEffect(() => {
    if (source == null) {
      const source = new EventSource(endpoint)

      const listener = (e) => {
        model.handleEvent(e)
        setModel(new Model(model))
      }

      model.eventNames().forEach((name) => {
        source.addEventListener(name, listener)
      })

      setSource(source)
    }
  }, [])

  return <ModelContext.Provider value={() => model}>{children}</ModelContext.Provider>
}

function useModel() {
  const context = React.useContext(ModelContext)
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider")
  }

  return context()
}

export { ModelProvider, useModel }
