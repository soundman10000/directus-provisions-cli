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
  id: number;
  collection: string;
  field: string;
  special: string[];

  interface: string;
  options: Record<string, any>;

  display: string;
  display_options: string;
  readonly: boolean;
  hidden: boolean;
  sort: number;
  width: 'half' | 'half-left' | 'half-right' | 'half-space' | 'full' | 'fill';

  translations: {
    [language: string]: string;
  }[];

  note?: string;
  required: boolean;
  group?: number;
  validation_message?: string;
}

export interface CollectionFields {
    name: string,
    fields: string[]
}