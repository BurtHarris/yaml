/**
 * Abstract Node class for the YAML Document (AST)
 */

export abstract class Node {
  comment?: string // a comment on or immediately after this
  commentBefore?: string // a comment before this
  range?: [number, number]
  // the [start, end] range of characters of the source parsed
  // into this node (undefined for pairs or if not parsed)
  spaceBefore?: boolean
  // a blank line before this node and its commentBefore
  tag?: string // a fully qualified tag, if required

  abstract toJSON(): string // a plain JS representation of this node
}
