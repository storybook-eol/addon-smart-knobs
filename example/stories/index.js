import React from 'react'
import { storiesOf } from '@storybook/react'
import { withSmartKnobs } from '../../src'
import { withKnobs, select } from '@storybook/addon-knobs'
import { withInfo } from '@storybook/addon-info'

import SmartKnobedComponent from './SmartKnobedComponent'
import SmartKnobedComponentMissingProps from './SmartKnobedComponentMissingProps'
import SmartKnobedComponentWithFlow from './SmartKnobedComponentWithFlow'
import { SmartKnobedComponentWithTypescript } from './SmartKnobedComponentWithTypescript'

const stub = fn => fn()

storiesOf('Basic', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('proptypes', () => <SmartKnobedComponent />)
  .add('flow', () => <SmartKnobedComponentWithFlow />)
  .add('typescript', () => <SmartKnobedComponentWithTypescript />)
  .add('nested example', () => (
    <div>
      <span />
      <SmartKnobedComponent />
    </div>
  ))

storiesOf('withInfo', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .addDecorator(withInfo)
  .add('proptypes', () => <SmartKnobedComponent />)

storiesOf('Missing props', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('example', () => (
    <SmartKnobedComponentMissingProps foo='baz' />
  ))

storiesOf('Manual knobs', module)
  .addDecorator(stub)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('example', () => (
    <SmartKnobedComponent string={ select('string', ['1', '2', '3'], '2') } />
  ))
