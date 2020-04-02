/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'

import { PropTable } from './PropTable'

const SmartKnobedComponentMissingProps = ({
  foo = '',
  bar = 'bar',
}) => (
  <code>
    <p>You should see a console.warn about a prop with default value bar.</p>
    <PropTable foo={ foo } bar={ bar } docgenInfo={ SmartKnobedComponentMissingProps.__docgenInfo } />
  </code>
)

SmartKnobedComponentMissingProps.propTypes = {
  foo: PropTypes.string.isRequired,
}

export default SmartKnobedComponentMissingProps
