import React, { PropTypes } from 'react'
import { storiesOf } from '@kadira/storybook'
import { withKnobs } from '@kadira/storybook-addon-knobs'
import { withSmartKnobs } from '../../src'

const Button = ({ children, onClick }) => (
  <button onClick={ onClick }>{ children }</button>
)

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.string,
}

storiesOf('Example of Knobs', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .add('simple example', () => (
    <Button>My button</Button>
  ))
