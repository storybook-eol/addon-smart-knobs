'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withSmartKnobs = exports.propTypeKnobResolver = exports.addKnobResolver = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _storybook = require('@kadira/storybook');

var _storybookAddonKnobs = require('@kadira/storybook-addon-knobs');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var knobResolvers = {};
var addKnobResolver = exports.addKnobResolver = function addKnobResolver(_ref) {
  var name = _ref.name;
  var resolver = _ref.resolver;
  var _ref$weight = _ref.weight;
  var weight = _ref$weight === undefined ? 0 : _ref$weight;
  return knobResolvers[name] = { name: name, resolver: resolver, weight: weight };
};

/*
 * Register default knob resolvers.
 * --------------------------------
 */

var propTypeKnobResolver = exports.propTypeKnobResolver = function propTypeKnobResolver(test, knob) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return function (name, validate, value, propTypes, defaultProps) {
    return !validate({ 'prop': test }, 'prop') ? knob.apply(undefined, [name, value].concat(args)) : undefined;
  };
};

/* eslint-disable no-multi-spaces */
// Default simple PropType based knob map.
var propTypeKnobsMap = [{ name: 'string', test: '', knob: _storybookAddonKnobs.text }, { name: 'number', test: 0, knob: _storybookAddonKnobs.number }, { name: 'bool', test: true, knob: _storybookAddonKnobs.boolean }, { name: 'func', test: function test() {}, knob: function knob(name, value) {
    return value || (0, _storybook.action)(name);
  } }, { name: 'object', test: {}, knob: _storybookAddonKnobs.object }];

propTypeKnobsMap.forEach(function (_ref2) {
  var name = _ref2.name;
  var test = _ref2.test;
  var knob = _ref2.knob;
  var _ref2$args = _ref2.args;
  var args = _ref2$args === undefined ? [] : _ref2$args;
  return addKnobResolver({
    name: name,
    resolver: propTypeKnobResolver.apply(undefined, [test, knob].concat(_toConsumableArray(args)))
  });
});

// Defalt oneOf PropType knob resolver.
addKnobResolver({
  name: 'oneOf',
  resolver: function resolver(name, validate, value, propTypes, defaultProps) {
    var error = validate({ 'prop': '' }, 'prop');
    var match = error ? /expected one of (\[.*\])/.exec(error.message) : null;

    if (match && match[1]) {
      var parsedOptions = JSON.parse(match[1]);
      var options = parsedOptions.reduce(function (res, value) {
        return _extends({}, res, _defineProperty({}, value, value));
      }, {});

      return (0, _storybookAddonKnobs.select)(name, _extends({
        '': '--'
      }, options), defaultProps[name]);
    }
  }
});

var withSmartKnobs = exports.withSmartKnobs = function withSmartKnobs(story, context) {
  var component = story();
  var propTypes = component.type.propTypes;
  var defaultProps = _extends({}, component.type.defaultProps, component.props);

  return (0, _react.cloneElement)(component, resolvePropValues(propTypes, defaultProps));
};

var resolvePropValues = function resolvePropValues(propTypes, defaultProps) {
  var propKeys = Object.keys(propTypes);
  var resolvers = Object.keys(knobResolvers).sort(function (a, b) {
    return knobResolvers[a].weight < knobResolvers[b].weight;
  }).map(function (name) {
    return knobResolvers[name].resolver;
  });

  return propKeys.map(function (prop) {
    return resolvers.reduce(function (value, resolver) {
      return value !== undefined ? value : resolver(prop, propTypes[prop], defaultProps[prop], propTypes, defaultProps);
    }, undefined);
  }).reduce(function (props, value, i) {
    return _extends({}, props, _defineProperty({}, propKeys[i], value));
  }, defaultProps);
};