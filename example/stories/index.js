import React from 'react'
import { storiesOf } from '@kadira/storybook'
import { withSmartKnobs } from '../../src'

import SmartKnobedComponent from './SmartKnobedComponent'

storiesOf('Example of smart Knobs', module)
  .addDecorator(withSmartKnobs)
  .add('full example', () => (
    <SmartKnobedComponent />
  ))


  console.log(SmartKnobedComponent.__docgenInfo)
