// Published as 'yaml/scalar'

import { toJSON } from '../toJSON'
import { Node } from './Node'

export class Scalar extends Node {
  constructor(public value: any) {
    super()
  }

  toJSON(arg, ctx): string {
    return ctx && ctx.keep ? this.value : toJSON(this.value, arg, ctx)
  }

  toString(): string {
    return String(this.value)
  }
}
