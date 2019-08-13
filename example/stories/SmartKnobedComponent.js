import React from 'react'
import PropTypes from 'prop-types'

import { PropTable } from './PropTable'

const SmartKnobedComponent = props => <PropTable { ...props } docgenInfo={ SmartKnobedComponent.__docgenInfo } />

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
