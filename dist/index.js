'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withSmartKnobs = exports.propTypeKnobResolver = exports.addKnobResolver = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _addonActions = require('@storybook/addon-actions');

var _addonKnobs = require('@storybook/addon-knobs');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var knobResolvers = {};
var addKnobResolver = exports.addKnobResolver = function addKnobResolver(_ref) {
  var name = _ref.name,
      resolver = _ref.resolver,
      _ref$weight = _ref.weight,
      weight = _ref$weight === undefined ? 0 : _ref$weight;
  return knobResolvers[name] = { name: name, resolver: resolver, weight: weight };
};

/*
 * Register default knob resolvers.
 * --------------------------------
 */

var propTypeKnobResolver = exports.propTypeKnobResolver = function propTypeKnobResolver(name, knob) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return function (propName, propType, value, propTypes, defaultProps) {
    return propType.type.name === name ? knob.apply(undefined, [propName, value].concat(args)) : undefined;
  };
};

/* eslint-disable no-multi-spaces */
// Default simple PropType based knob map.
var propTypeKnobsMap = [{ name: 'string', knob: _addonKnobs.text }, { name: 'number', knob: _addonKnobs.number }, { name: 'bool', knob: _addonKnobs.boolean }, { name: 'func', knob: function knob(name, value) {
    return value || (0, _addonActions.action)(name);
  } }, { name: 'object', knob: _addonKnobs.object }, { name: 'node', knob: _addonKnobs.text }, { name: 'element', knob: _addonKnobs.text }];

propTypeKnobsMap.forEach(function (_ref2, weight) {
  var name = _ref2.name,
      knob = _ref2.knob,
      _ref2$args = _ref2.args,
      args = _ref2$args === undefined ? [] : _ref2$args;
  return addKnobResolver({
    weight: weight * 10,
    name: 'PropTypes.' + name,
    resolver: propTypeKnobResolver.apply(undefined, [name, knob].concat(_toConsumableArray(args)))
  });
});

// Register 'oneOf' PropType knob resolver.
addKnobResolver({
  name: 'PropTypes.oneOf',
  resolver: function resolver(propName, propType, value, propTypes, defaultProps) {
    /* eslint-disable quotes */
    if (propType.type.name === 'enum' && propType.type.value.length) {
      try {
        var options = propType.type.value.map(function (value) {
          return value.value;
        })
        // Cleanup string quotes, if any.
        .map(function (value) {
          return value[0] === "'" && value[value.length - 1] === "'" ? '"' + value.replace(/'"'/g, '\\"').slice(1, value.length - 1) + '"' : value;
        }).map(JSON.parse).reduce(function (res, value) {
          return _extends({}, res, _defineProperty({}, value, value));
        }, {});

        return (0, _addonKnobs.select)(propName, _extends({ '': '--' }, options), defaultProps[propName]);
      } catch (e) {}
    }
  }
});

var withSmartKnobs = exports.withSmartKnobs = function withSmartKnobs(story, context) {
  var component = story(context);
  var _component$type$__doc = component.type.__docgenInfo;
  _component$type$__doc = _component$type$__doc === undefined ? { props: {} } : _component$type$__doc;
  var props = _component$type$__doc.props;

  var defaultProps = _extends({}, component.type.defaultProps || {}, component.props);

  var finalProps = props ? Object.keys(props).reduce(function (acc, n) {
    var item = props[n];

    if (!item.type) {
      console.warn('There is a prop with defaultValue ' + item.defaultValue.value + ' but it wasnt specified on element.propTypes. Check story: "' + context.kind + '".');
      return acc;
    }

    return _extends({}, acc, _defineProperty({}, n, item));
  }, {}) : {};

  return (0, _react.cloneElement)(component, resolvePropValues(finalProps, defaultProps));
};

var resolvePropValues = function resolvePropValues(propTypes, defaultProps) {
  var propNames = Object.keys(propTypes);
  var resolvers = Object.keys(knobResolvers).sort(function (a, b) {
    return knobResolvers[a].weight < knobResolvers[b].weight;
  }).map(function (name) {
    return knobResolvers[name].resolver;
  });

  return propNames.map(function (propName) {
    return resolvers.reduce(function (value, resolver) {
      return value !== undefined ? value : resolver(propName, propTypes[propName], defaultProps[propName], propTypes, defaultProps);
    }, undefined);
  }).reduce(function (props, value, i) {
    return _extends({}, props, _defineProperty({}, propNames[i], value !== undefined ? value : defaultProps[propNames[i]]));
  }, defaultProps);
};