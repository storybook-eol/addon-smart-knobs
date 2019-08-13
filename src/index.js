import { cloneElement, Children } from 'react'
import { action } from '@storybook/addon-actions'
import { logger } from '@storybook/client-logger'
import { text, boolean, number, object, select } from '@storybook/addon-knobs'

const QUOTED_STRING_REGEXP = /^['"](.*)['"]$/
const cleanupString = str => str.replace(QUOTED_STRING_REGEXP, '$1')

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
const withDefaultOption = (options) => ({ '': '--', ...options })
const createSelect = (propName, elements, defaultValue) => {
  try {
    const options = elements
    // Cleanup string quotes, if any.
      .map(value => cleanupString(value.value))
      .reduce(optionsReducer, {})

    return select(propName, withDefaultOption(options), defaultValue)
  }
  catch (e) { }
}

// Register 'oneOf' PropType knob resolver.
addKnobResolver({
  name: 'PropTypes.oneOf',
  resolver: (propName, propType, defaultValue) => {
    if (propType.type.name === 'enum' && propType.type.value.length) {
      return createSelect(propName, propType.type.value, defaultValue)
    }
    // for flow support
    if (propType.type.name === 'union' && propType.type.elements) {
      return createSelect(propName, propType.type.elements, defaultValue)
    }
    // for typescript support
    if (propType.type.name.includes('|')) {
      const values = propType.type.name.split('|').map(v => v.trim())

      if (values.length && values.every(value => QUOTED_STRING_REGEXP.test(value))) {
        return createSelect(propName, values.map(value => ({ value })), defaultValue)
      }
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
      (value, resolver) => {
        const propType = propTypes[propName] || {}
        const defaultValue = defaultProps[propName] || (propType.defaultValue && cleanupString(propType.defaultValue.value || '')) || undefined

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
