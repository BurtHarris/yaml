// const defaultOptions = {
//   anchorPrefix: 'a',
//   customTags: null,
//   keepCstNodes: false,
//   keepNodeTypes: true,
//   keepBlobsInJSON: true,
//   mapAsMap: false,
//   maxAliasCount: 100,
//   prettyErrors: false, // TODO Set true in v2
//   simpleKeys: false,
//   version: '1.2'
// }

import * as ast from './ast'
import * as cst from './cst'

import { default as cstNode } from './cst/Node'

export interface ParseOptions {
  /**
   * Prefix to use in generating anchor names
   */
  anchorPrefix: string
  /**
   * Allow non-JSON JavaScript objects to remain in the `toJSON` output.
   * Relevant with the YAML 1.1 `!!timestamp` and `!!binary` tags. By default `true`.
   */
  keepBlobsInJSON?: boolean
  /**
   * Include references in the AST to each node's corresponding CST node. By default `false`.
   */
  keepCstNodes?: boolean
  /**
   * Store the original node type when parsing documents. By default `true`.
   */
  keepNodeTypes?: boolean
  /**
   * When outputting JS, use Map rather than Object to represent mappings. By default `false`.
   */
  mapAsMap?: boolean
  /**
   * Enable support for `<<` merge keys.
   */
  merge?: boolean
  /**
   * The base schema to use. By default `"core"` for YAML 1.2 and `"yaml-1.1"` for earlier versions.
   */
  schema?: 'core' | 'failsafe' | 'json' | 'yamlS-1.1'
  /**
   * Array of additional (custom) tags to include in the schema.
   */
  tags?: Tag[] | ((tags: Tag[]) => Tag[])
  /**
   * The YAML version used by documents without a `%YAML` directive. By default `"1.2"`.
   */
  version?: string
}

export interface Tag {
  /**
   * A JavaScript class that should be matched to this tag, e.g. `Date` for `!!timestamp`.
   */
  class?: new () => any
  /**
   * An optional factory function, used e.g. by collections when wrapping JS objects as AST nodes.
   */
  createNode?: (value: any) => ast.MapBase | ast.SeqBase | ast.Scalar
  /**
   * If `true`, the tag should not be explicitly included when stringifying.
   */
  default?: boolean
  /**
   * If a tag has multiple forms that should be parsed and/or stringified differently, use `format` to identify them.
   */
  format?: string
  /**
   * The `Node` child class that implements this tag. Required for collections and tags that have overlapping JS representations.
   */
  nodeClass?: new () => any
  /**
   * Used by some tags to configure their stringification, where applicable.
   */
  options?: object
  /**
   * Should return an instance of a class extending `Node`.
   * If test is set, will be called with the resulting match as arguments.
   * Otherwise, will be called as `resolve(doc, cstNode)`.
   */
  resolve(doc: ast.Document, cstNode: cst.Node): ast.Node
  resolve(...match: string[]): ast.Node
  /**
   * @param item the node being stringified.
   * @param ctx contains the stringifying context variables.
   * @param onComment a function that should be called if the stringifier includes the item's comment in its output.
   */
  stringify(
    item: ast.Node,
    ctx: StringifyContext,
    onComment: () => void
  ): string
  /**
   * The fully qualified name of the tag.
   */
  tag: string
  /**
   * Used to match string values of scalar nodes; captured parts will be passed as arguments of `resolve()`.
   */
  test?: RegExp
}

export interface StringifyContext {
  [key: string]: any
}

export type YAMLError = YAMLSyntaxError | YAMLSemanticError | YAMLReferenceError

export interface YAMLSyntaxError extends SyntaxError {
  name: 'YAMLSyntaxError'
  source: cst.Node
}

export interface YAMLSemanticError extends SyntaxError {
  name: 'YAMLSemanticError'
  source: cst.Node
}

export interface YAMLReferenceError extends ReferenceError {
  name: 'YAMLReferenceError'
  source: cst.Node
}

export interface YAMLWarning extends Error {
  name: 'YAMLReferenceError'
  source: cst.Node
}
