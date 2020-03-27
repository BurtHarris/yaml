import { parse as parseCST } from './cst/parse'
import { Document as YAMLDocument } from './Document'
import { YAMLSemanticError } from './errors'
import { Schema } from './schema'
import { warn } from './warnings'
import { ParseOptions, Tag, StringifyContext } from './ParseOptions'

/**
 * @internal
 */
const defaultOptions = {
  anchorPrefix: 'a',
  customTags: null,
  keepCstNodes: false,
  keepNodeTypes: true,
  keepBlobsInJSON: true,
  mapAsMap: false,
  maxAliasCount: 100,
  prettyErrors: false, // TODO Set true in v2
  simpleKeys: false,
  version: '1.2'
}

export function createNode(value: any, tag?: string)
export function createNode(value: any, wrapScalars: boolean, tag?: string)
export function createNode(
  value: any,
  wrapScalars: boolean | string = true,
  tag?: string
) {
  if (tag === undefined && typeof wrapScalars === 'string') {
    tag = wrapScalars
    wrapScalars = true
  }
  const options = Object.assign(
    {},
    YAMLDocument.defaults[defaultOptions.version],
    defaultOptions
  )
  const schema = new Schema(options)
  return schema.createNode(value, wrapScalars, tag)
}

export class Document extends YAMLDocument {
  constructor(options) {
    super(Object.assign({}, defaultOptions, options))
  }
}

export function parseAllDocuments(src: string, options: ParseOptions) {
  const stream = []
  let prev
  for (const cstDoc of parseCST(src)) {
    const doc = new Document(options)
    doc.parse(cstDoc, prev)
    stream.push(doc)
    prev = doc
  }
  return stream
}

export function parseDocument(
  src: string,
  options: ParseOptions = defaultOptions
) {
  const cst = parseCST(src)
  const doc = new Document(options).parse(cst[0])
  if (cst.length > 1) {
    const errMsg =
      'Source contains multiple documents; please use YAML.parseAllDocuments()'
    doc.errors.unshift(new YAMLSemanticError(cst[1], errMsg))
  }
  return doc
}

function parse(src: string, options: ParseOptions) {
  const doc = parseDocument(src, options)
  doc.warnings.forEach(warning => warn(warning))
  if (doc.errors.length > 0) throw doc.errors[0]
  return doc.toJSON()
}

function stringify(value, options) {
  const doc = new Document(options)
  doc.contents = value
  return String(doc)
}

export const YAML = {
  createNode,
  defaultOptions,
  Document,
  parse,
  parseAllDocuments,
  parseCST,
  parseDocument,
  stringify
}

export type { ParseOptions, Tag, StringifyContext }