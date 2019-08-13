// @flow
import React from 'react'

import { PropTable } from './PropTable'

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

const SmartKnobedComponent = (props: PropType) => <PropTable { ...props } docgenInfo={ SmartKnobedComponent.__docgenInfo } />

export default SmartKnobedComponent
