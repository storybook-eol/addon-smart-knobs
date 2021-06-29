import React from 'react'
import PropTypes from 'prop-types'

import { PropTable } from './PropTable'

const SmartKnobedComponentWithDefaultProps = props => <PropTable { ...props } docgenInfo={ SmartKnobedComponentWithDefaultProps.__docgenInfo } />

SmartKnobedComponentWithDefaultProps.propTypes = {
  bool: PropTypes.bool,
  number: PropTypes.number,
  string: PropTypes.string,
  func: PropTypes.func,
  oneOf: PropTypes.oneOf(['one', 'two', 'three']),
  object: PropTypes.object,
  element: PropTypes.element,
  node: PropTypes.node,
}

SmartKnobedComponentWithDefaultProps.defaultProps = {
  bool: false,
  number: 0,
  string: '',
  func: null,
  oneOf: 'one',
  object: {},
  element: null,
  node: '',
}

export default SmartKnobedComponentWithDefaultProps
