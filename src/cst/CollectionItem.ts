//@ts-check
import { Type } from '../constants'
import { YAMLSemanticError } from '../errors'
import { BlankLine } from './BlankLine'
import { Node } from './Node'
import { Range } from './Range'
// eslint-disable-next-line no-unused-vars
import { default as ParseContext, PartialContext } from './ParseContext'

export class CollectionItem extends Node {
  node: Node = null

  constructor(type: string, props: Range[]) {
    super(type, props)
  }

  get includesTrailingLines() {
    return !!this.node && this.node.includesTrailingLines
  }

  /**
   * @param {PartialContext} context
   * @param {number} start - Index of first character
   * @returns {number} - Index of the character after this
   */
  parse(context: Partial<ParseContext>, start: number) {
    this.context = context
    // @ts-ignore trace
    trace: 'item-start', context.pretty, { start }
    const { parseNode, src } = context
    let { atLineStart, lineStart } = context
    if (!atLineStart && this.type === Type.SEQ_ITEM)
      this.error = new YAMLSemanticError(
        this,
        'Sequence items must not have preceding content on the same line'
      )
    const indent = atLineStart ? start - lineStart : context.indent
    let offset = Node.endOfWhiteSpace(src, start + 1)
    let ch = src[offset]
    const inlineComment = ch === '#'
    const comments = []
    let blankLine = null
    while (ch === '\n' || ch === '#') {
      if (ch === '#') {
        const end = Node.endOfLine(src, offset + 1)
        comments.push(new Range(offset, end))
        offset = end
      } else {
        atLineStart = true
        lineStart = offset + 1
        const wsEnd = Node.endOfWhiteSpace(src, lineStart)
        if (src[wsEnd] === '\n' && comments.length === 0) {
          blankLine = new BlankLine()
          lineStart = blankLine.parse({ src }, lineStart)
        }
        offset = Node.endOfIndent(src, lineStart)
      }
      ch = src[offset]
    }
    // @ts-ignore trace
    trace: 'item-parse?',
      {
        indentDiff: offset - (lineStart + indent),
        ch: ch && JSON.stringify(ch)
      }
    if (
      Node.nextNodeIsIndented(
        ch,
        offset - (lineStart + indent),
        this.type !== Type.SEQ_ITEM
      )
    ) {
      this.node = parseNode(
        { atLineStart, inCollection: false, indent, lineStart, parent: this },
        offset
      )
    } else if (ch && lineStart > start + 1) {
      offset = lineStart - 1
    }
    if (this.node) {
      if (blankLine) {
        // Only blank lines preceding non-empty nodes are captured. Note that
        // this means that collection item range start indices do not always
        // increase monotonically. -- eemeli/yaml#126
        // @ts-ignore
        const items = context.parent.items || context.parent.contents
        if (items) items.push(blankLine)
      }
      if (comments.length) Array.prototype.push.apply(this.props, comments)
      offset = this.node.range.end
    } else {
      if (inlineComment) {
        const c = comments[0]
        this.props.push(c)
        offset = c.end
      } else {
        offset = Node.endOfLine(src, start + 1)
      }
    }
    const end = this.node ? this.node.valueRange.end : offset
    // @ts-ignore trace
    trace: 'item-end', { start, end, offset }
    this.valueRange = new Range(start, end)
    return offset
  }

  setOrigRanges(cr: any, offset: any) {
    offset = super.setOrigRanges(cr, offset)
    return this.node ? this.node.setOrigRanges(cr, offset) : offset
  }

  toString() {
    const {
      context: { src },
      node,
      range,
      value
    } = this
    if (value != null) return value
    const str = node
      ? src.slice(range.start, node.range.start) + String(node)
      : src.slice(range.start, range.end)
    return Node.addStringTerminator(src, range.end, str)
  }
}
