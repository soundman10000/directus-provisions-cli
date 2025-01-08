interface ErrorItem {
  message: string
  extensions: object
}

const headersMapSymbol: unique symbol = Symbol('headers map')
const headersMapSortedSymbol: unique symbol = Symbol('headers map sorted')

interface HeadersList {
  cookies: null | string
  [headersMapSymbol]: Map<string, string>
  [headersMapSortedSymbol]: null | string[]
}

interface ResponseState {
  aborted: boolean
  rangeRequested: boolean
  timingAllowPassed: boolean
  requestIncludesCredentials: boolean
  type: string
  status: number
  timingInfo: object
  cacheState: string
  statusText: string
  headersList: HeadersList
  urlList: string[]
  body: object
}

interface Response {
  realm: null
  state: ResponseState
  headers: HeadersList
}

export interface DirectusResponse {
  data: Record<string, any>[]
  errors?: ErrorItem[]
  response: Response
}

export interface Collection {
  collection: string
  meta: {
    collection: string
    icon: null | string
    note: null | string
    display_template: null | string
    hidden: boolean
    singleton: boolean
    translations: null | any
    archive_field: string
    archive_app_filter: boolean
    archive_value: string
    unarchive_value: string
    sort_field: string
    accountability: string
    color: null | string
    item_duplication_fields: null | any
    sort: number
    group: string
    collapse: 'open' | 'closed'
    preview_url: null | string
    versioning: boolean
  }
  schema: {
    name: string
    schema: string | null
    catalog: string
  }
}

export interface Field {
  id: number
  collection: string
  field: string
  type: string
  schema: FieldSchema | null
  meta: FieldMeta | null
}

interface FieldSchema {
  name: string
  table: string
  data_type: string
  default_value: null
  generation_expression: null
  max_length: number
  numeric_precision: null
  numeric_scale: null
  is_generated: boolean
  is_nullable: boolean
  is_unique: boolean
  is_indexed: boolean
  is_primary_key: boolean
  has_auto_increment: boolean
  foreign_key_column: string | null
  foreign_key_table: string | null
}

interface FieldMeta {
  id: number
  collection: string
  field: string
  special: string[]
  interface: string
  options: null
  display: null
  display_options: null
  readonly: boolean
  hidden: boolean
  sort: number
  width: string
  translations: null
  note: null
  conditions: null
  required: boolean
  group: null
  validation: null
  validation_message: null
}

export interface CollectionFields {
    name: string,
    fields: string[]
}