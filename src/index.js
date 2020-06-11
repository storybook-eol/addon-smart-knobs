import { cloneElement, Children } from 'react'
import { action } from '@storybook/addon-actions'
import { logger } from '@storybook/client-logger'
import { text, boolean, number, object, select } from '@storybook/addon-knobs'
import { makeDecorator } from '@storybook/addons'

const QUOTED_STRING_REGEXP = /^['"](.*)['"]$/

const cleanupValue = (value) => typeof value === 'string' ? value.replace(QUOTED_STRING_REGEXP, '$1') : value

const knobResolvers = {}
export const addKnobResolver = ({ name, resolver, weight = 0 }) => (knobResolvers[name] = { name, resolver, weight })

/*
 * Register default knob resolvers.
 * --------------------------------
 */

export const propTypeKnobResolver = (name, regexp, knob, ...args) =>
  (propName, propType, value) =>
    (propType.type.name === name || (regexp && regexp.test(propType.type.name)))
      ? knob(propName, value, ...args)
      : undefined

const flowTypeKnobsMap = [
  { name: 'signature', knob: (name, value) => value || action(name) },
  { name: 'boolean', knob: boolean },
]

/* eslint-disable no-multi-spaces */
// Default simple PropType based knob map.
const propTypeKnobsMap = [
  { name: 'string', knob: text },
  { name: 'number', knob: number },
  { name: 'bool', knob: boolean },
  { name: 'func', regexp: /=>/, knob: (name, value) => value || action(name) },
  { name: 'object', regexp: /^{.*}$/, knob: object },
  { name: 'node', regexp: /^ReactNode$/, knob: text },
  { name: 'element', knob: text },
  { name: 'array', regexp: /\[]$|^\[.*]$/, knob: object },
]

const typeKnobsMap = [...flowTypeKnobsMap, ...propTypeKnobsMap]

typeKnobsMap.forEach(({ name, regexp, knob, args = [] }, weight) => addKnobResolver({
  weight: weight * 10,
  name: `PropTypes.${name}`,
  resolver: propTypeKnobResolver(name, regexp, knob, ...args)
}))

const optionsReducer = (res, value) => ({ ...res, [value]: value })
const withDefaultOption = (options) => ({ '--': undefined, ...options })
const createSelect = (propName, elements, defaultValue, isRequired) => {
  try {
    const options = elements
    // Cleanup string quotes, if any.
      .map(value => cleanupValue(value.value))
      .reduce(optionsReducer, {})
    const value = defaultValue || (isRequired && Object.values(options)[0]) || undefined
    return select(propName, isRequired ? options : withDefaultOption(options), value)
  }
  catch (e) { }
}

// Register 'oneOf' PropType knob resolver.
addKnobResolver({
  name: 'PropTypes.oneOf',
  resolver: (propName, propType, defaultValue) => {
    if (propType.type.name === 'enum' && propType.type.value.length) {
      return createSelect(propName, propType.type.value, defaultValue, propType.required)
    }
    // for flow support
    if (propType.type.name === 'union' && propType.type.elements) {
      return createSelect(propName, propType.type.elements, defaultValue, propType.required)
    }
  }
})

const ensureType = (item) => item.flowType ? ({ ...item, type: item.flowType }) : item

const getNewProps = (target, context, opts) => {
  const { __docgenInfo: { props } = { props: {} } } = target.type
  const { ignoreProps = [] } = opts
  const defaultProps = {
    ...(target.type.defaultProps || {}),
    ...target.props
  }

  const finalProps = props ? Object.keys(props).reduce((acc, n) => {
    const item = ensureType(props[n])

    if (ignoreProps.includes(n)) {
      return acc
    }

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

const mutateChildren = (component, context, opts) => {
  return cloneElement(component, { children: Children.map(component.props.children, (child) => {
    if (child.type && child.type.__docgenInfo) {
      const newProps = getNewProps(child, context, opts)

      return cloneElement(child, { ...child.props, ...newProps })
    }

    if (child.props && child.props.children) {
      return mutateChildren(child, context, opts)
    }

    return child
  }) })
}

export const withSmartKnobs = (opts = {}) => makeDecorator({
  name: 'withSmartKnobs',
  parameterName: 'smartKnobs',
  skipIfNoParametersOrOptions: false,
  wrapper: (story, context) => {
    const component = story(context)

    if (!component.type.__docgenInfo && component.props.children) {
      return mutateChildren(component, context, opts)
    }

    const newProps = getNewProps(component, context, opts)

    return cloneElement(component, newProps)
  },
})

const getDefaultValue = (defaultProp, propType) => {
  // If the defaultProp is not undefined, return it. This avoids relying on the
  // truthiness of the value, which doesn't work for falsy values.
  if (typeof defaultProp !== 'undefined') {
    return defaultProp
  }

  if (propType.defaultValue) {
    return cleanupValue(propType.defaultValue.value)
  }

  return undefined
}

const resolvePropValues = (propTypes, defaultProps) => {
  const propNames = Object.keys(propTypes)
  const resolvers = Object.keys(knobResolvers)
    .sort((a, b) => knobResolvers[a].weight < knobResolvers[b].weight)
    .map(name => knobResolvers[name].resolver)

  return propNames
    .map(propName => resolvers.reduce(
      (value, resolver) => {
        const propType = propTypes[propName] || {}
        const defaultValue = getDefaultValue(defaultProps[propName], propType)

        return value !== undefined ? value
          : resolver(propName, propType, defaultValue)
      },
      undefined
    ))
    .reduce((props, value, i) => ({
      ...props,
      [propNames[i]]: value !== undefined ? value : defaultProps[propNames[i]]
    }), defaultProps)
}
