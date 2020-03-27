export class Range {
  static copy(orig: Range) {
    return new Range(orig.start, orig.end)
  }

  start: number
  end: number
  origStart?: number
  origEnd?: number

  constructor(start: number, end?: number) {
    this.start = start
    this.end = end || start
  }

  isEmpty() {
    return typeof this.start !== 'number' || !this.end || this.end <= this.start
  }

  /**
   * Set `origStart` and `origEnd` to point to the original source range for
   * this node, which may differ due to dropped CR characters.
   * @internal
   * @param {number[]} cr - Positions of dropped CR characters
   * @param {number} offset - Starting index of `cr` from the last call
   * @returns {number} - The next offset, matching the one found for `origStart`
   */
  setOrigRange(cr: Array<number>, offset: number): number {
    const { start, end } = this
    if (cr.length === 0 || end <= cr[0]) {
      this.origStart = start
      this.origEnd = end
      return offset
    }
    let i = offset
    while (i < cr.length) {
      if (cr[i] > start) break
      else ++i
    }
    this.origStart = start + i
    const nextOffset = i
    while (i < cr.length) {
      // if end was at \n, it should now be at \r
      if (cr[i] >= end) break
      else ++i
    }
    this.origEnd = end + i
    return nextOffset
  }
}
