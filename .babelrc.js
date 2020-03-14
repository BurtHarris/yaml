const isBrowser = process.env.BABEL_ENV === 'browser'

const envOptions = isBrowser
  ? { modules: false, useBuiltIns: false }
  : { targets: { node: '6.5' }, useBuiltIns: false }
const presets = [
  ['@babel/env', envOptions],
  '@babel/preset-typescript'
]

const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/proposal-object-rest-spread',
  ['babel-plugin-trace', { strip: true }]
]
if (isBrowser) plugins.push('@babel/plugin-transform-runtime')

module.exports = { presets, plugins }
