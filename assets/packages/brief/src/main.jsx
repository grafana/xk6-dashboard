// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import { render } from 'preact'
import { Brief } from './Brief.jsx'
import data from './data'

import 'uplot/dist/uPlot.min.css';

import './styles.scss'

import './index.css'

data().then(d => render(<Brief data={d} config={window.config}/>, document.getElementById('root')))
