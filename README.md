# transform-assets-webpack-plugin

A configurable plugin for applying asset transformations in Webpack.

## Installation

    npm install transform-assets-webpack-plugin

## Example

This example removes all `a` characters from `.txt` assets.

```js
const TransformAssetsPlugin = require('transform-assets-webpack-plugin')

module.exports = {
  plugins: [
    new TransformAssetsPlugin({
      transformations: [
        {
          test: /\.txt$/,
          transform: (buff) => Promise.resolve(
            Buffer.from(buff.toString('utf8').replace(/a/g, ''))
          )
        }
      ]
    })
  ]
}
```

## API

### new TransformAssetsPlugin(options)

#### options.disable

**type**: `boolean`
**default**: `false`

When set to `true` the plugin will not do anything. This is useful
for disabling transformations during development, and only performing
them in production.

#### options.maxConcurrency

**type**: `number`
**default**: The number of logical CPUs on the system

Sets the maximum of concurrent asset processing workers.

#### options.transformations

**type**: `Array<{ test: Function|RegExp, transform: Function }>`
**default**: `[]`

An array of transformations that will be applied to each asset, in
order.

Each transformation is an object with a `test` and `transform` property.
`test` is either a regular expression or a function taking a `string`
pathname and returning a `boolean`. If the test is positive, the
transformation will be applied to the asset's contents. `transform`
needs to accept and return a `Promise<Buffer>`.
