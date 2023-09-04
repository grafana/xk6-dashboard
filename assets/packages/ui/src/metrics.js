// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import React from "react";
import { useSSE } from "react-hooks-sse";
import { Metrics } from "@xk6-dashboard/model";

function reducer(state, action) {
  let newState = new Metrics(state);

  newState.push(action.data);

  return newState;
}

function useMetricEvent() {
  return useSSE("metric", new Metrics(), {
    parser: JSON.parse,
    stateReducer: reducer,
  });
}

const MetricsContext = React.createContext(new Metrics());
MetricsContext.displayName = "Metrics";

export { MetricsContext, useMetricEvent };
