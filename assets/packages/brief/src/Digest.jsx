// SPDX-FileCopyrightText: 2023 Iván Szkiba
//
// SPDX-License-Identifier: MIT

import './Digest.css'

import { iterable } from './util';

const propertyNames = {
  'trend': ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  'counter': ["rate", "count"],
  'rate': ["rate"],
  'gauge': ["value"]
}

export function Digest(props) {
  const { summary, type, series } = props

  const filter = (key) => (!iterable(series) || series.includes(key)) && (summary.values[key].type == type)

  return (
    <table class="table table-hover caption-top">
      <caption>{props.caption}</caption>
      <thead>
        <tr>
          <th>metric</th>
          {
            propertyNames[type].map((name) => (<th>{name}</th>))
          }
        </tr>
      </thead>
      <tbody>
        {
          Object.keys(summary.values).filter(filter).map(key => (
            <tr>
              <th>{key}</th>
              {
                propertyNames[type].map((name) => (
                  <td>
                    {
                      summary.values[key].format(name)
                    }
                  </td>
                ))
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}
