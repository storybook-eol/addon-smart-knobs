import React from 'react'
import PropTypes from 'prop-types'

import './PropTable.css'

export const PropTable = ({ docgenInfo, ...props }) => (
  <table className='PropTable'>
    <thead>
      <tr>
        <th>Property</th>
        <th>PropType</th>
        <th>Value</th>
        <th>typeof</th>
      </tr>
    </thead>
    <tbody>{
      Object.keys(props)
        .map(prop => (
          <tr key={ prop }>
            <th>{ prop }</th>
            <td>{ (docgenInfo.props[prop].type || docgenInfo.props[prop].flowType || {}).name }</td>
            <td>{ typeof props[prop] === 'function' ? <i>function</i> : JSON.stringify(props[prop]) || '(empty)' }</td>
            <td>{ typeof props[prop] }</td>
          </tr>
        ))
    }</tbody>
  </table>
)

PropTable.propTypes = {
  docgenInfo: PropTypes.object.isRequired
}
