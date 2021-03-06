import opt from './dist/tags/options.js'
export const binaryOptions = opt.binaryOptions
export const boolOptions = opt.boolOptions
export const nullOptions = opt.nullOptions
export const strOptions = opt.strOptions

import schema from './dist/schema/index.js'
export const Schema = schema.Schema

import map from './dist/schema/Map.js'
export const YAMLMap = map.YAMLMap

import seq from './dist/schema/Seq.js'
export const YAMLSeq = seq.YAMLSeq

import pair from './dist/schema/Pair.js'
export const Pair = pair.Pair

import scalar from './dist/schema/Scalar.js'
export const Scalar = scalar.Scalar
