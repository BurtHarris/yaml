import { composeStream } from './compose/compose-stream.js'
import { LogLevel } from './constants.js'
import { Document } from './doc/Document.js'
import { YAMLParseError } from './errors.js'
import { warn } from './log.js'
import { Options } from './options.js'

export { defaultOptions, scalarOptions } from './options.js'
export { visit } from './visit.js'
export { Document }

export function parseAllDocuments(src: string, options?: Options) {
  return composeStream(src, false, options)
}

export function parseDocument(src: string, options?: Options) {
  const docs = composeStream(src, true, options)
  if (docs.length === 0) return null
  const doc = docs[0]
  if (
    docs.length > 1 &&
    LogLevel.indexOf(doc.options.logLevel) >= LogLevel.ERROR
  ) {
    const errMsg =
      'Source contains multiple documents; please use YAML.parseAllDocuments()'
    doc.errors.push(new YAMLParseError(docs[1].range[0], errMsg))
  }
  return doc
}

export function parse(
  src: string,
  reviver?: (key: string, value: any) => any,
  options?: Options
) {
  if (options === undefined && reviver && typeof reviver === 'object') {
    options = reviver
    reviver = undefined
  }

  const doc = parseDocument(src, options)
  if (!doc) return null
  doc.warnings.forEach(warning => warn(doc.options.logLevel, warning))
  if (doc.errors.length > 0) {
    if (LogLevel.indexOf(doc.options.logLevel) >= LogLevel.ERROR)
      throw doc.errors[0]
    else doc.errors = []
  }
  return doc.toJS({ reviver })
}

export function stringify(
  value: any,
  replacer?: (key: string, value: any) => any,
  options?: string | number | Options
) {
  if (typeof options === 'string') options = options.length
  if (typeof options === 'number') {
    const indent = Math.round(options)
    options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent }
  }
  if (value === undefined) {
    const { keepUndefined } = options || (replacer as Options) || {}
    if (!keepUndefined) return undefined
  }
  return new Document(value, replacer || null, options).toString()
}
