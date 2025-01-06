import { createDirectus,
  RestClient,
  readItems,
  readCollections, 
  rest,
  utilsExport,
  utilsImport,
  readAssetRaw,
  staticToken,
  StaticTokenClient 
} from '@directus/sdk'

import { DirectusResponse, Collection } from '../types/directus'
import { v4 as uuidv4 } from 'uuid'
import { Logger } from '../logger/logger'
import { config } from '../config/config'



export class DirectusClient {
  private static instance: DirectusClient
  private logger: Logger
  private client: ReturnType<typeof createDirectus> & RestClient<any> & StaticTokenClient<any>

  public static getInstance(): DirectusClient {
    if (!DirectusClient.instance) {
      DirectusClient.instance = new DirectusClient()
    }
    return DirectusClient.instance
  }

  constructor() {
    this.logger = Logger.getInstance()

    this.client = createDirectus(config.directusUrl)
      .with(rest())
      .with(staticToken(config.directusToken))
  }

  public async listItems(collection: string): Promise<any[]> {
    try {
      return await this.client.request(readItems(collection))
    } catch (exception) {
      this.handleError(exception)
    }

    return []
  }

  public async readCollections(): Promise<Collection[]> {
    try {
      return await this.client.request(readCollections()).then(z => z as Collection[])
    } catch (exception) {
      this.handleError(exception)
    }

    return []
  }

  public async export(collection: string): Promise<string> {
    const id: string = uuidv4()
    try {
      await this.client.request(utilsExport(collection, 'csv', {}, { id }))
    } catch (exception) {
      this.handleError(exception)
    }

    return id
  }

  public async download(id: string): Promise<ReadableStream<Uint8Array>> {
    try {
      return await this.client.request(readAssetRaw(id))
    } catch (exception) {
      this.handleError(exception)
      throw exception
    }
  }

  public async upload(collection: string, file: FormData): Promise<void> {
    try {
      await this.client.request(utilsImport(collection, file))
    } catch (exception) {
      this.handleError(exception)
      throw exception
    }
  }

  private handleError(error: any): void {
    if (this.isDirectusResponse(error)) {
      const errorMessage = 'Directus API Errors: ' + (error.errors?.map(err => err.message).join(', ') || 'No error messages')
      this.logger.logError(errorMessage)
    } else {
      const errorText = error instanceof Error ? error.message : JSON.stringify(error)
      this.logger.logError('Unexpected Error: ' + errorText)
    }
  }

  private isDirectusResponse(error: any): error is DirectusResponse {
    return 'errors' in error && Array.isArray(error.errors)
  }
}