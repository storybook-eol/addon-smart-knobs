import React from 'react'
import { storiesOf } from '@storybook/react'
import { withSmartKnobs } from '../../src'
import { withKnobs, select, date } from '@storybook/addon-knobs'
import { withInfo } from '@storybook/addon-info'

import SmartKnobedComponent from './SmartKnobedComponent'
import SmartKnobedComponentMissingProps from './SmartKnobedComponentMissingProps'
import SmartKnobedComponentWithFlow from './SmartKnobedComponentWithFlow'

const stub = fn => fn()

storiesOf('Basic', module)
  .addDecorator(withSmartKnobs())
  .addDecorator(withKnobs)
  .add('proptypes', () => <SmartKnobedComponent />)
  .add('flow', () => <SmartKnobedComponentWithFlow />)
  .add('nested example', () => (
    <div>
      <h1>Title</h1>
      <SmartKnobedComponent />
    </div>
  ))

storiesOf('withInfo', module)
  .addDecorator(withSmartKnobs())
  .addDecorator(withKnobs)
  .addDecorator(withInfo)
  .add('proptypes', () => <SmartKnobedComponent />)

storiesOf('Missing props', module)
  .addDecorator(withSmartKnobs())
  .addDecorator(withKnobs)
  .add('example', () => (
    <SmartKnobedComponentMissingProps foo='baz' />
  ))

storiesOf('Manual knobs', module)
  .addDecorator(stub)
  .addDecorator(withSmartKnobs())
  .addDecorator(withKnobs)
  .add('example', () => (
    <SmartKnobedComponent string={ select('string', ['1', '2', '3'], '2') } />
  ))

storiesOf('Ignore Props', module)
  .addDecorator(withSmartKnobs({ ignoreProps: ['number'] }))
  .addDecorator(withKnobs)
  .add('proptypes', () => <SmartKnobedComponent number={ date('date', new Date()) } />)
