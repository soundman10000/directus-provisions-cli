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
    color: null | string;
    item_duplication_fields: null | any
    sort: number
    group: string;
    collapse: 'open' | 'closed'
    preview_url: null | string
    versioning: boolean
  };
  schema: {
    name: string
    schema: string | null
    catalog: string
  };
}