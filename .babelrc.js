const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/proposal-object-rest-spread',
  ['babel-plugin-trace', { strip: true }]
]
const envOptions = { modules: false, useBuiltIns: false }

if (process.env.BABEL_ENV === 'browser') {
  plugins.push('@babel/plugin-transform-runtime')
} else {
  plugins.push(['@babel/plugin-transform-modules-commonjs', { strict: true }])
  envOptions.targets = { node: '6.5' }
}

const presets = [['@babel/env', envOptions], '@babel/preset-typescript']
module.exports = { presets, plugins }
