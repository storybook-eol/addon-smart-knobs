import { cloneElement } from 'react'
import { action } from '@kadira/storybook'
import { text, boolean, number, object, select } from '@kadira/storybook-addon-knobs'

const knobResolvers = {}
export const addKnobResolver = ({ name, resolver, weight = 0 }) => (knobResolvers[name] = { name, resolver, weight })

/*
 * Register default knob resolvers.
 * --------------------------------
 */

export const propTypeKnobResolver = (test, knob, ...args) =>
  (name, validate, value, propTypes, defaultProps) => !validate({ 'prop': test }, 'prop')
    ? knob(name, value, ...args) : undefined

/* eslint-disable no-multi-spaces */
// Default simple PropType based knob map.
const propTypeKnobsMap = [
  { name: 'string', test: '',       knob: text },
  { name: 'number', test: 0,        knob: number },
  { name: 'bool',   test: true,     knob: boolean },
  { name: 'func',   test: () => {}, knob: (name, value) => value || action(name) },
  { name: 'object', test: {},       knob: object }
]

propTypeKnobsMap.forEach(({ name, test, knob, args = [] }) => addKnobResolver({
  name,
  resolver: propTypeKnobResolver(test, knob, ...args)
}))

// Defalt oneOf PropType knob resolver.
addKnobResolver({
  name: 'oneOf',
  resolver: (name, validate, value, propTypes, defaultProps) => {
    const error = validate({ 'prop': '' }, 'prop')
    const match = error ? /expected one of (\[.*\])/.exec(error.message) : null

    if (match && match[1]) {
      const parsedOptions = JSON.parse(match[1])
      const options = parsedOptions.reduce((res, value) => ({ ...res, [value]: value }), {})

      return select(name, {
        '': '--',
        ...options
      }, defaultProps[name])
    }
  }
})

export const withSmartKnobs = (story, context) => {
  const component = story()
  const propTypes = component.type.propTypes
  const defaultProps = {
    ...component.type.defaultProps,
    ...component.props
  }

  return cloneElement(component, resolvePropValues(propTypes, defaultProps))
}

const resolvePropValues = (propTypes, defaultProps) => {
  const propKeys = Object.keys(propTypes)
  const resolvers = Object.keys(knobResolvers)
    .sort((a, b) => knobResolvers[a].weight < knobResolvers[b].weight)
    .map(name => knobResolvers[name].resolver)

  return propKeys
    .map(prop => resolvers.reduce(
      (value, resolver) => value !== undefined ? value
        : resolver(prop, propTypes[prop], defaultProps[prop], propTypes, defaultProps),
      undefined
    ))
    .reduce((props, value, i) => ({
      ...props,
      [propKeys[i]]: value
    }), defaultProps)
}
