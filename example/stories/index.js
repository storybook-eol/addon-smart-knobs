import React from 'react'
import { storiesOf } from '@kadira/storybook'
import { withSmartKnobs } from '../../src'

import SmartKnobedComponent from './SmartKnobedComponent';
import SmartKnobedComponentMissingProps from './SmartKnobedComponentMissingProps';

storiesOf('Example of smart Knobs', module)
  .addDecorator(withSmartKnobs)
  .add('full example', () => (
    <SmartKnobedComponent />
  ))

storiesOf('Smart Knobs missing props', module)
  .addDecorator(withSmartKnobs)
  .add('example', () => (
    <SmartKnobedComponentMissingProps foo="baz" />
  ))
