import { cloneElement, Children } from 'react'
import { action } from '@storybook/addon-actions'
import { logger } from '@storybook/client-logger'
import { text, boolean, number, object, select } from '@storybook/addon-knobs'

const QUOTED_STRING_REGEXP = /^['"](.*)['"]$/

const cleanupValue = (value) => typeof value === 'string' ? value.replace(QUOTED_STRING_REGEXP, '$1') : value

const knobResolvers = {}
export const addKnobResolver = ({ name, resolver, weight = 0 }) => (knobResolvers[name] = { name, resolver, weight })

/*
 * Register default knob resolvers.
 * --------------------------------
 */

export const propTypeKnobParams = (knob, propName, value, groupId, ...args) => {
  switch (propName) {
    case 'number':
      return knob(propName, value, {}, groupId, ...args)
    default:
      return knob(propName, value, groupId, ...args)
  }
}

export const propTypeKnobResolver = (name, regexp, knob, ...args) =>
  (propName, propType, value, groupId) =>
    (propType.type.name === name || (regexp && regexp.test(propType.type.name)))
      ? propTypeKnobParams(knob, propName, value, groupId, ...args)
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
const createSelect = (propName, elements, defaultValue, isRequired, groupId) => {
  try {
    const options = elements
    // Cleanup string quotes, if any.
      .map(value => cleanupValue(value.value))
      .reduce(optionsReducer, {})
    const value = defaultValue || (isRequired && Object.values(options)[0]) || undefined
    return select(propName, isRequired ? options : withDefaultOption(options), value, groupId)
  }
  catch (e) { }
}

// Register 'oneOf' PropType knob resolver.
addKnobResolver({
  name: 'PropTypes.oneOf',
  resolver: (propName, propType, defaultValue, groupId) => {
    if (propType.type.name === 'enum' && propType.type.value.length) {
      return createSelect(propName, propType.type.value, defaultValue, propType.required, groupId)
    }
    // for flow support
    if (propType.type.name === 'union' && propType.type.elements) {
      return createSelect(propName, propType.type.elements, defaultValue, propType.required, groupId)
    }
  }
})

const ensureType = (item) => item.flowType ? ({ ...item, type: item.flowType }) : item

const getNewProps = (target, context, opts, id) => {
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

  return resolvePropValues(finalProps, defaultProps, id)
}

const mutateChildren = (component, context, opts, index = 0) => {
  const shouldGroup = Children.count(component.props.children) > 1

  return cloneElement(component, { children: Children.map(component.props.children, (child, i) => {
    if (child.type && child.type.__docgenInfo) {
      const newProps = getNewProps(child, context, opts, shouldGroup ? index + '-' + i : null)

      return cloneElement(child, { ...child.props, ...newProps })
    }

    if (child.props && child.props.children) {
      return mutateChildren(child, context, opts, index + 1)
    }

    return child
  }) })
}

export const withSmartKnobs = (opts = {}) => (story, context) => {
  const component = story(context)

  if (!component.type.__docgenInfo && component.props.children) {
    return mutateChildren(component, context, opts)
  }

  const newProps = getNewProps(component, context, opts)

  return cloneElement(component, newProps)
}

const resolvePropValues = (propTypes, defaultProps, groupId) => {
  const propNames = Object.keys(propTypes)
  const resolvers = Object.keys(knobResolvers)
    .sort((a, b) => knobResolvers[a].weight < knobResolvers[b].weight)
    .map(name => knobResolvers[name].resolver)

  return propNames
    .map(propName => resolvers.reduce(
      (value, resolver) => {
        const propType = propTypes[propName] || {}
        const defaultValue = defaultProps[propName] || (propType.defaultValue && cleanupValue(propType.defaultValue.value || '')) || undefined

        return value !== undefined ? value
          : resolver(propName, propType, defaultValue, groupId)
      },
      undefined
    ))
    .reduce((props, value, i) => ({
      ...props,
      [propNames[i]]: value !== undefined ? value : defaultProps[propNames[i]]
    }), defaultProps)
}
