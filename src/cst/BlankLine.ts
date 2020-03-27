import { Type } from '../constants'
import { Node } from './Node'
import { Range } from './Range'
// eslint-disable-next-line no-unused-vars
import { ParseContext, PartialContext } from './ParseContext'

export class BlankLine extends Node {
  constructor() {
    super(Type.BLANK_LINE)
  }

  /* istanbul ignore next */
  get includesTrailingLines() {
    // This is never called from anywhere, but if it were,
    // this is the value it should return.
    return true
  }

  /**
   * Parses blank lines from the source
   *
   * @param {{src:string}} context
   * @param {number} start - Index of first \n character
   * @returns {number} - Index of the character after this
   */
  parse(context, start) {
    this.context = context
    const { src } = context
    let offset = start + 1
    while (Node.atBlank(src, offset)) {
      const lineEnd = Node.endOfWhiteSpace(src, offset)
      // @ts-ignore see issue: questionable code in BlankLine.js #150
      if (lineEnd === '\n') offset = lineEnd + 1
      else break
    }
    this.range = new Range(start, offset)
    // @ts-ignore trace
    trace: this.type, { offset, range: this.range }
    return offset
  }
}