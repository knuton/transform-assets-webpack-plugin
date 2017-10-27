const cpus = require('os').cpus
const createThrottle = require('async-throttle')
const map = require('lodash.map')
const RawSource = require('webpack-sources/lib/RawSource')

module.exports = class TransformAssetsPlugin {
  constructor (options) {
    options = options || {}

    this.options = {
      disable: options.disable || false,
      maxConcurrency: options.maxConcurrency || cpus().length,
      transformations: options.transformations || []
    }

  }

  apply (compiler) {
    // If disabled, short-circuit here and just return
    if (this.options.disable === true) return null

    // Access the assets once they have been assembled
    compiler.plugin('emit', async (compilation, callback) => {
      const throttle = createThrottle(this.options.maxConcurrency)

      try {
        await processAssets(throttle, compilation, this.options.transformations)
        callback()
      } catch (err) {
        callback(err)
      }
    })
  }
}

/**
 * Transform assets from webpack and put them back in the asset array when done
 * @param  {Function} throttle       The setup throttle library
 * @param  {Object} compilation      The compilation from webpack-sources
 * @param  {Object} transformations  The transformations to apply
 * @return {Promise}                 Resolves when all assets have been processed
 */
async function processAssets (throttle, compilation, transformations) {
  return Promise.all(map(compilation.assets, (asset, filename) => throttle(async () => {
    const assetSource = asset.source()
    for (const { test, transform } of transformations) {
      if (!isMatch(test, filename)) continue

      console.log(filename)

      // Ensure that the file contents are in the form of a buffer
      const assetBuffer = (Buffer.isBuffer(assetSource) ? assetSource : Buffer.from(assetSource, 'utf8'))

      compilation.assets[filename] = new RawSource(await transform(assetBuffer))
    }
  })))
}

/**
 * Applies a test to a string
 * @param {RegExp|Function} test   The test to apply
 * @param {string}          path   The string to test
 * @return {boolean}               Test result
 */
function isMatch (test, path) {
  if (typeof test === 'function') {
    return test(path)
  } else if (test != null && typeof test.test === 'function') {
    return test.test(path)
  } else {
    return false
  }
}
