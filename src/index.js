import { cloneElement, Children } from 'react'
import { action } from '@storybook/addon-actions'
import { logger } from '@storybook/client-logger'
import { text, boolean, number, object, select } from '@storybook/addon-knobs'

const knobResolvers = {}
export const addKnobResolver = ({ name, resolver, weight = 0 }) => (knobResolvers[name] = { name, resolver, weight })

/*
 * Register default knob resolvers.
 * --------------------------------
 */

export const propTypeKnobResolver = (name, knob, ...args) =>
  (propName, propType, value, propTypes, defaultProps) =>
    propType.type.name === name ? knob(propName, value, ...args) : undefined

const flowTypeKnobsMap = [
  { name: 'signature', knob: (name, value) => value || action(name) },
  { name: 'boolean', knob: boolean },
]

/* eslint-disable no-multi-spaces */
// Default simple PropType based knob map.
const propTypeKnobsMap = [
  { name: 'string', knob: text },
  { name: 'number', knob: number },
  { name: 'bool',   knob: boolean },
  { name: 'func',   knob: (name, value) => value || action(name) },
  { name: 'object', knob: object },
  { name: 'node', knob: text },
  { name: 'element', knob: text },
  { name: 'array', knob: object },
]

const typeKnobsMap = [...flowTypeKnobsMap, ...propTypeKnobsMap]

typeKnobsMap.forEach(({ name, knob, args = [] }, weight) => addKnobResolver({
  weight: weight * 10,
  name: `PropTypes.${name}`,
  resolver: propTypeKnobResolver(name, knob, ...args)
}))

const optionsReducer = (res, value) => ({ ...res, [value]: value })
const withDefaultOption = (options) => ({ '': '--', ...options })
const createSelect = (propName, elements, defaultProps) => {
  try {
    const options = elements
    // Cleanup string quotes, if any.
      .map(value => value.value.replace(/^['"](.*)['"]$/, '$1'))
      .reduce(optionsReducer, {})
    return select(propName, withDefaultOption(options), defaultProps[propName])
  }
  catch (e) { }
}

// Register 'oneOf' PropType knob resolver.
addKnobResolver({
  name: 'PropTypes.oneOf',
  resolver: (propName, propType, value, propTypes, defaultProps) => {
    if (propType.type.name === 'enum' && propType.type.value.length) {
      return createSelect(propName, propType.type.value, defaultProps)
    }
    // for flow support
    if (propType.type.name === 'union' && propType.type.elements) {
      return createSelect(propName, propType.type.elements, defaultProps)
    }
  }
})

const ensureType = (item) => item.flowType ? ({ ...item, type: item.flowType }) : item

const getNewProps = (target, context) => {
  const { __docgenInfo: { props } = { props: {} } } = target.type
  const defaultProps = {
    ...(target.type.defaultProps || {}),
    ...target.props
  }

  const finalProps = props ? Object.keys(props).reduce((acc, n) => {
    const item = ensureType(props[n])

    if (!item.type) {
      const defaultValue = item.defaultValue ? item.defaultValue.value : 'Unknown'
      logger.warn(`There is a prop with defaultValue ${defaultValue} but it wasn't specified on element.propTypes. Check story: "${context.kind}".`)
      return acc
    }

    return {
      ...acc,
      [n]: item,
    }
  }, {}) : {}

  return resolvePropValues(finalProps, defaultProps)
}

const mutateChildren = (component) => {
  return cloneElement(component, { children: Children.map(component.props.children, (child) => {
    if (child.type.__docgenInfo) {
      const newProps = getNewProps(child)

      return cloneElement(child, { ...child.props, ...newProps })
    }

    if (child.props.children) {
      return mutateChildren(child)
    }

    return child
  }) })
}

export const withSmartKnobs = (story, context) => {
  const component = story(context)

  if (!component.type.__docgenInfo && component.props.children) {
    return mutateChildren(component)
  }

  const newProps = getNewProps(component, context)

  return cloneElement(component, newProps)
}

const resolvePropValues = (propTypes, defaultProps) => {
  const propNames = Object.keys(propTypes)
  const resolvers = Object.keys(knobResolvers)
    .sort((a, b) => knobResolvers[a].weight < knobResolvers[b].weight)
    .map(name => knobResolvers[name].resolver)

  return propNames
    .map(propName => resolvers.reduce(
      (value, resolver) => value !== undefined ? value
        : resolver(propName, propTypes[propName], defaultProps[propName], propTypes, defaultProps),
      undefined
    ))
    .reduce((props, value, i) => ({
      ...props,
      [propNames[i]]: value !== undefined ? value : defaultProps[propNames[i]]
    }), defaultProps)
}
