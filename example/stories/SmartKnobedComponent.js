import React from 'react'
import PropTypes from 'prop-types'

import './SmartKnobedComponent.css'

const SmartKnobedComponent = props => (
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
          <td>{ SmartKnobedComponent.__docgenInfo.props[prop].type.name }</td>
          <td>{ typeof props[prop] === 'function' ? <i>function</i> : JSON.stringify(props[prop]) || '(empty)' }</td>
          <td>{ typeof props[prop] }</td>
        </tr>
      ))}
    </tbody>
  </table>
)

SmartKnobedComponent.propTypes = {
  bool: PropTypes.bool,
  number: PropTypes.number,
  string: PropTypes.string,
  func: PropTypes.func,
  oneOf: PropTypes.oneOf(['one', 'two', 'three']),
  object: PropTypes.object,
  element: PropTypes.element,
  node: PropTypes.node,
}

export default SmartKnobedComponent
