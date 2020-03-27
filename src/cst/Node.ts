import { Char, Type } from '../constants'
import { getLinePos } from './source-utils'
import { Range } from './Range'
import { YAMLError } from '../errors'
import { ParseContext } from './ParseContext'

/** Root class of all nodes */
/** @member {{src: string}} context */
export class Node {
  static addStringTerminator(src: string, offset: number, str: string) {
    if (str[str.length - 1] === '\n') return str
    const next = Node.endOfWhiteSpace(src, offset)
    return next >= src.length || src[next] === '\n' ? str + '\n' : str
  }

  // ^(---|...)
  static atDocumentBoundary(src: string, offset: number, sep?: string) {
    const ch0 = src[offset]
    if (!ch0) return true
    const prev = src[offset - 1]
    if (prev && prev !== '\n') return false
    if (sep) {
      if (ch0 !== sep) return false
    } else {
      if (ch0 !== Char.DIRECTIVES_END && ch0 !== Char.DOCUMENT_END) return false
    }
    const ch1 = src[offset + 1]
    const ch2 = src[offset + 2]
    if (ch1 !== ch0 || ch2 !== ch0) return false
    const ch3 = src[offset + 3]
    return !ch3 || ch3 === '\n' || ch3 === '\t' || ch3 === ' '
  }

  static endOfIdentifier(src: string, offset: number) {
    let ch = src[offset]
    const isVerbatim = ch === '<'
    const notOk = isVerbatim
      ? ['\n', '\t', ' ', '>']
      : ['\n', '\t', ' ', '[', ']', '{', '}', ',']
    while (ch && notOk.indexOf(ch) === -1) ch = src[(offset += 1)]
    if (isVerbatim && ch === '>') offset += 1
    return offset
  }

  static endOfIndent(src: string, offset: number) {
    let ch = src[offset]
    while (ch === ' ') ch = src[(offset += 1)]
    return offset
  }

  static endOfLine(src: string, offset: number, inFlow?: boolean) {
    let ch = src[offset]
    while (ch && ch !== '\n') ch = src[(offset += 1)]
    return offset
  }

  static endOfWhiteSpace(src: string, offset: number) {
    let ch = src[offset]
    while (ch === '\t' || ch === ' ') ch = src[(offset += 1)]
    return offset
  }

  static startOfLine(src: string, offset: number) {
    let ch = src[offset - 1]
    if (ch === '\n') return offset
    while (ch && ch !== '\n') ch = src[(offset -= 1)]
    return offset + 1
  }

  /**
   * End of indentation, or null if the line's indent level is not more
   * than `indent`
   *
   * @param {string} src
   * @param {number} indent
   * @param {number} lineStart
   * @returns {?number}
   */
  static endOfBlockIndent(src: string, indent: number, lineStart) {
    const inEnd = Node.endOfIndent(src, lineStart)
    if (inEnd > lineStart + indent) {
      return inEnd
    } else {
      const wsEnd = Node.endOfWhiteSpace(src, inEnd)
      const ch = src[wsEnd]
      if (!ch || ch === '\n') return wsEnd
    }
    return null
  }

  static atBlank(src: string, offset: number, endAsBlank: boolean = false) {
    const ch = src[offset]
    return ch === '\n' || ch === '\t' || ch === ' ' || (endAsBlank && !ch)
  }

  static nextNodeIsIndented(ch, indentDiff, indicatorAsIndent) {
    if (!ch || indentDiff < 0) return false
    if (indentDiff > 0) return true
    return indicatorAsIndent && ch === '-'
  }

  // should be at line or string end, or at next non-whitespace char
  static normalizeOffset(src: string, offset: number) {
    const ch = src[offset]
    return !ch
      ? offset
      : ch !== '\n' && src[offset - 1] === '\n'
      ? offset - 1
      : Node.endOfWhiteSpace(src, offset)
  }

  // fold single newline into space, multiple newlines to N - 1 newlines
  // presumes src[offset] === '\n'
  static foldNewline(src: string, offset: number, indent) {
    let inCount = 0
    let error = false
    let fold = ''
    let ch = src[offset + 1]
    while (ch === ' ' || ch === '\t' || ch === '\n') {
      switch (ch) {
        case '\n':
          inCount = 0
          offset += 1
          fold += '\n'
          break
        case '\t':
          if (inCount <= indent) error = true
          offset = Node.endOfWhiteSpace(src, offset + 2) - 1
          break
        case ' ':
          inCount += 1
          offset += 1
          break
      }
      ch = src[offset + 1]
    }
    if (!fold) fold = ' '
    if (ch && inCount <= indent) error = true
    return { fold, offset, error }
  }

  error: YAMLError = null
  props: Array<Range>
  range: Range = null
  value: any = null
  valueRange: Range = null
  header: any

  constructor(
    public type: string,
    props?: Array<Range>,
    public context: Partial<ParseContext> = null
  ) {
    // Object.defineProperty(this, 'context', {
    //   value: context || null,
    //   writable: true
    // })

    this.props = props ?? []
    // The following added in TypeScript port, might check

    this.context = context // Object.defineProperty not picked up by tsc!
    this.header = undefined
  }

  getPropValue(idx: number, key: string, skipKey: boolean) {
    if (!this.context) return null
    const { src } = this.context
    const prop = this.props[idx]
    return prop && src[prop.start] === key
      ? src.slice(prop.start + (skipKey ? 1 : 0), prop.end)
      : null
  }

  get anchor() {
    for (let i = 0; i < this.props.length; ++i) {
      const anchor = this.getPropValue(i, Char.ANCHOR, true)
      if (anchor != null) return anchor
    }
    return null
  }

  get comment() {
    const comments = []
    for (let i = 0; i < this.props.length; ++i) {
      const comment = this.getPropValue(i, Char.COMMENT, true)
      if (comment != null) comments.push(comment)
    }
    return comments.length > 0 ? comments.join('\n') : null
  }

  commentHasRequiredWhitespace(start: number) {
    const { src } = this.context
    if (this.header && start === this.header.end) return false
    if (!this.valueRange) return false
    const { end } = this.valueRange
    return start !== end || Node.atBlank(src, end - 1)
  }

  get hasComment() {
    if (this.context) {
      const { src } = this.context
      for (let i = 0; i < this.props.length; ++i) {
        if (src[this.props[i].start] === Char.COMMENT) return true
      }
    }
    return false
  }

  get hasProps() {
    if (this.context) {
      const { src } = this.context
      for (let i = 0; i < this.props.length; ++i) {
        if (src[this.props[i].start] !== Char.COMMENT) return true
      }
    }
    return false
  }

  get includesTrailingLines() {
    return false
  }

  get jsonLike() {
    const jsonLikeTypes = [
      Type.FLOW_MAP,
      Type.FLOW_SEQ,
      Type.QUOTE_DOUBLE,
      Type.QUOTE_SINGLE
    ]
    return jsonLikeTypes.indexOf(this.type) !== -1
  }

  get rangeAsLinePos() {
    if (!this.range || !this.context) return undefined
    //@ts-ignore Confusion over type Document...
    const start = getLinePos(this.range.start, this.context.root)
    if (!start) return undefined
    //@ts-ignore Confusion over type Document...
    const end = getLinePos(this.range.end, this.context.root)
    return { start, end }
  }

  get rawValue() {
    if (!this.valueRange || !this.context) return null
    const { start, end } = this.valueRange
    return this.context.src.slice(start, end)
  }

  get tag() {
    for (let i = 0; i < this.props.length; ++i) {
      const tag = this.getPropValue(i, Char.TAG, false)
      if (tag != null) {
        if (tag[1] === '<') {
          return { verbatim: tag.slice(2, -1) }
        } else {
          // eslint-disable-next-line no-unused-vars
          const [_, handle, suffix] = tag.match(/^(.*!)([^!]*)$/)
          return { handle, suffix }
        }
      }
    }
    return null
  }

  get valueRangeContainsNewline() {
    if (!this.valueRange || !this.context) return false
    const { start, end } = this.valueRange
    const { src } = this.context
    for (let i = start; i < end; ++i) {
      if (src[i] === '\n') return true
    }
    return false
  }

  parseComment(start: number) {
    const { src } = this.context
    if (src[start] === Char.COMMENT) {
      const end = Node.endOfLine(src, start + 1)
      const commentRange = new Range(start, end)
      this.props.push(commentRange)
      // @ts-ignore trace
      trace: commentRange,
        JSON.stringify(
          this.getPropValue(this.props.length - 1, Char.COMMENT, true)
        )
      return end
    }
    return start
  }

  /**
   * Populates the `origStart` and `origEnd` values of all ranges for this
   * node. Extended by child classes to handle descendant nodes.
   *
   * @param {number[]} cr - Positions of dropped CR characters
   * @param {number} offset - Starting index of `cr` from the last call
   * @returns {number} - The next offset, matching the one found for `origStart`
   */
  setOrigRanges(cr: Array<number>, offset: number) {
    if (this.range) offset = this.range.setOrigRange(cr, offset)
    if (this.valueRange) this.valueRange.setOrigRange(cr, offset)
    this.props.forEach(prop => prop.setOrigRange(cr, offset))
    return offset
  }

  toString() {
    const {
      context: { src },
      range,
      value
    } = this
    if (value != null) return value
    const str = src.slice(range.start, range.end)
    return Node.addStringTerminator(src, range.end, str)
  }
}