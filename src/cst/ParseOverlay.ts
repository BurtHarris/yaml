import { Char, Type } from '../constants'
import { YAMLSyntaxError } from '../errors'
import Alias from './Alias'
import BlockValue from './BlockValue'
import Collection from './Collection'
import CollectionItem from './CollectionItem'
import FlowCollection from './FlowCollection'
import Node from './Node'
import PlainValue from './PlainValue'
import QuoteDouble from './QuoteDouble'
import QuoteSingle from './QuoteSingle'
import Range from './Range'

export default interface ParseOverlay {
  atLineStart?: boolean    /** Node starts at beginning of line */
  inFlow?: boolean         /** true if currently in a flow context */
  inCollection?: boolean   /** true if currently in a collection context  */
  indent?: number          /** Current level of indentation  */
  lineStart?: number       /** Start of the current line  */
  parent?: Node            /** The parent of the node  */
  src?: string             /** Source of the YAML document */
  (overlay: ParseOverlay, start: number)
}
