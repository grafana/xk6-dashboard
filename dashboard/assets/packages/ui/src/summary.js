// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import React from "react";
import { useSSE } from "react-hooks-sse";
import { Summary, Metrics } from "@xk6-dashboard/model";

function reducer(state, action) {
  const newState = new Summary(state);

  newState.update(action.data);

  return newState;
}

function useSummary(metricsHook) {
  return useSSE("cumulative", new Summary(), {
    parser: JSON.parse,
    stateReducer: function (state, action) {
      let newState = reducer(state, action);
      newState.annotate(metricsHook().values);

      return newState;
    },
  });
}

const SummaryContext = React.createContext(new Summary());
SummaryContext.displayName = "Summary";

export { SummaryContext, useSummary };
