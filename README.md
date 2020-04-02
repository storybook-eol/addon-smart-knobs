# Smart knobs addon for Storybook

This Storybook plugin uses `@storybook/addon-knobs` but creates the knobs automatically based on PropTypes, Flow and Typescript.

## Installation:

```
npm i storybook-addon-smart-knobs --save-dev
```

## Usage:

```js
import React from 'react'
import PropTypes from 'prop-types'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withSmartKnobs } from 'storybook-addon-smart-knobs'

const Button = ({ children, onClick }) => (
  <button onClick={ onClick }>{ children }</button>
)

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
}

storiesOf('Button')
  .addDecorator(withSmartKnobs(options))
  .addDecorator(withKnobs)
  .add('simple', () => <Button>Smart knobed button</Button>)

```

## Options

- **ignoreProps**
  
  Type: `Array`

  Will not automatically create knobs for props whose name is in this array. Example:
  ```js
    .withSmartKnobs({ ignoreProps: ['numberProp'] })
    .add('example', () => <div numberProp={date('date', date)} />) 
  ```

## Configuration:

This plugin has a peer dependency on [babel-plugin-react-docgen
](https://github.com/storybooks/babel-plugin-react-docgen). As a result, `babel-plugin-react-docgen` needs to be added to your Storybook Babel configuration.

For a standard Storybook configuration, add `react-docgen` to your plugins in an appropriate `.babelrc` file.

  - [README | babel-plugin-react-docgen](https://github.com/storybooks/babel-plugin-react-docgen/blob/master/README.md)
  - [Custom Babel Config | Storybook](https://storybook.js.org/configurations/custom-babel-config/).

If you have created a `webpack.config.js` file for Storybook, you may need to configure the plugin in there.

```
module.exports = (baseConfig, env, defaultConfig) => {
  defaultConfig.module.rules[0].use[0].options.plugins = [
    require.resolve('babel-plugin-react-docgen'),
  ]

  return defaultConfig
}
```
## Demo:
Check out the [latest example via now.sh](https://addon-smart-knobs.barakplasma.now.sh/)

## Typescript:

Use [react-docgen-typescript-loader](https://github.com/strothj/react-docgen-typescript-loader) to generate docgen info from Typescript types. This docgen info will be used to automatically create knobs.
