// SPDX-FileCopyrightText: 2023 Iván Szkiba
// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: MIT

import { render } from 'preact'
import { Report } from './Report.jsx'
import data from './data'

import 'uplot/dist/uPlot.min.css';

import './styles.scss'

import './index.css'

data().then(d => render(<Report data={d} config={d.config} />, document.getElementById('root')))
