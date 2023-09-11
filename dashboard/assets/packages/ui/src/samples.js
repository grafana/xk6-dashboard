// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from "react";
import { useSSE } from "react-hooks-sse";
import { Samples, Metrics } from "@xk6-dashboard/model";

const propTime = "time";

function reducer(state, action) {
  var newState;

  var lastEventId = parseInt(action.event.lastEventId);
  if (isNaN(lastEventId)) {
    lastEventId = 0;
  }

  if (state.lastEventId > lastEventId) {
    newState = new Samples();
  } else {
    newState = new Samples(state);
  }

  newState.push(action.data);
  newState.lastEventId = lastEventId;

  return newState;
}

function useEvent(name, metricsHook) {
  return useSSE(name, new Samples(), {
    parser: JSON.parse,
    stateReducer: function (state, action) {
      let newState = reducer(state, action);
      newState.annotate(metricsHook().values);
      return newState;
    },
  });
}

const SamplesContext = React.createContext(new Samples());
SamplesContext.displayName = "Samples";

export { SamplesContext, useEvent, propTime };
