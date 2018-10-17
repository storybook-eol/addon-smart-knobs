// @flow
import React from 'react'
import './SmartKnobedComponent.css'

/* eslint-disable */
type PropType = {
  bool: boolean,
  number: number,
  string: string,
  func: () => void,
  oneOf: 'one' | 'two' | 'three',
  object: {}
}
/* eslint-enable */

const SmartKnobedComponent = (props: PropType) => (
  <table className='SmartKnobedComponent'>
    <thead>
      <tr>
        <th>Property</th>
        <th>PropType</th>
        <th>Value</th>
        <th>typeof</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(props).map(prop => (
        <tr key={ prop }>
          <th>{ prop }</th>
          <td>{ SmartKnobedComponent.__docgenInfo.props[prop].flowType.name }</td>
          <td>{ typeof props[prop] === 'function' ? <i>function</i> : JSON.stringify(props[prop]) || '(empty)' }</td>
          <td>{ typeof props[prop] }</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default SmartKnobedComponent
