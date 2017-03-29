import React from 'react'
import { storiesOf } from '@kadira/storybook'
import { withSmartKnobs } from '../../src'
import { withKnobs, select } from '@kadira/storybook-addon-knobs';

import SmartKnobedComponent from './SmartKnobedComponent';
import SmartKnobedComponentMissingProps from './SmartKnobedComponentMissingProps';

const stub = fn => fn();

storiesOf('Example of smart Knobs', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('full example', () => (
    <SmartKnobedComponent />
  ))

storiesOf('Smart Knobs missing props', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('example', () => (
    <SmartKnobedComponentMissingProps foo="baz" />
  ))

storiesOf('Smart Knobs with manual knobs', module)
  .addDecorator(stub)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('example', () => (
    <SmartKnobedComponent string={ select('string', ['1', '2', '3'], '2') }/>
  ))
