import { cloneElement } from 'react'
import { action } from '@kadira/storybook'
import { withKnobs, text, boolean, number, object, select } from '@kadira/storybook-addon-knobs'

const knobResolvers = {}
export const addKnobResolver = ({ name, resolver, weight = 0 }) => (knobResolvers[name] = { name, resolver, weight })

/*
 * Register default knob resolvers.
 * --------------------------------
 */

export const propTypeKnobResolver = (name, knob, ...args) =>
  (propName, propType, value, propTypes, defaultProps) =>
    propType.type.name === name ? knob(propName, value, ...args) : undefined

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
]

propTypeKnobsMap.forEach(({ name, knob, args = [] }, weight) => addKnobResolver({
  weight: weight * 10,
  name: `PropTypes.${name}`,
  resolver: propTypeKnobResolver(name, knob, ...args)
}))

// Register 'oneOf' PropType knob resolver.
addKnobResolver({
  name: 'PropTypes.oneOf',
  resolver: (propName, propType, value, propTypes, defaultProps) => {
    /* eslint-disable quotes */
    if (propType.type.name === 'enum' && propType.type.value.length) {
      try {
        const options = propType.type.value
        .map(value => value.value)
        // Cleanup string quotes, if any.
        .map(value => value[0] === "'" && value[value.length - 1] === "'"
        ? '"' + value.replace(/'"'/g, '\\"').slice(1, value.length - 1) + '"' : value)
        .map(JSON.parse)
        .reduce((res, value) => ({ ...res, [value]: value }), {})

        return select(propName, { '': '--', ...options }, defaultProps[propName])
      }
      catch (e) { }
    }
  }
})

export const withSmartKnobs = (story, context) => {
  const component = story(context)
  const { __docgenInfo: { props } = { props: { } } } = component.type
  const defaultProps = {
    ...(component.type.defaultProps || {}),
    ...component.props
  }

  const finalProps = Object.keys(props).reduce((acc, n) => {
    const item = props[n];
    if (!item.type) {
      console.warn(`There is a prop with defaultValue ${item.defaultValue.value} but it wasnt specified on element.propTypes. Check story: "${context.kind}".`);
      return acc;
    }

    return {
      ...acc,
      [n]: item,
    };
  }, {});

  return withKnobs(() => cloneElement(component, resolvePropValues(finalProps, defaultProps)), context)
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
      [propNames[i]]: value
    }), defaultProps)
}
