export type LogLevelId = 'silent' | 'error' | 'warn' | 'debug'

export const Char = {
  ANCHOR: '&',
  COMMENT: '#',
  TAG: '!',
  DIRECTIVES_END: '-',
  DOCUMENT_END: '.'
}

export const LogLevel = Object.assign<
  LogLevelId[],
  { SILENT: 0; ERROR: 1; WARN: 2; DEBUG: 3 }
>(['silent', 'error', 'warn', 'debug'], {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  DEBUG: 3
})

export enum Type {
  ALIAS = 'ALIAS',
  BLANK_LINE = 'BLANK_LINE',
  BLOCK_FOLDED = 'BLOCK_FOLDED',
  BLOCK_LITERAL = 'BLOCK_LITERAL',
  COMMENT = 'COMMENT',
  DIRECTIVE = 'DIRECTIVE',
  DOCUMENT = 'DOCUMENT',
  FLOW_MAP = 'FLOW_MAP',
  FLOW_SEQ = 'FLOW_SEQ',
  MAP = 'MAP',
  MAP_KEY = 'MAP_KEY',
  MAP_VALUE = 'MAP_VALUE',
  PLAIN = 'PLAIN',
  QUOTE_DOUBLE = 'QUOTE_DOUBLE',
  QUOTE_SINGLE = 'QUOTE_SINGLE',
  SEQ = 'SEQ',
  SEQ_ITEM = 'SEQ_ITEM'
}

export const defaultTagPrefix = 'tag:yaml.org,2002:'
export const defaultTags = {
  MAP: 'tag:yaml.org,2002:map',
  SEQ: 'tag:yaml.org,2002:seq',
  STR: 'tag:yaml.org,2002:str'
}
