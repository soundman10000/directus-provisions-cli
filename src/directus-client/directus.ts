import { 
  createDirectus,
  RestClient,
  readItems,
  readCollections, 
  rest,
  utilsExport,
  utilsImport,
  readAssetRaw,
  staticToken,
  StaticTokenClient, 
  readFields
} from '@directus/sdk'

import { v4 as uuidv4 } from 'uuid'
import type { Field, CollectionFields, DirectusResponse, Collection } from './directus.d'
import { Logger } from '../logger/logger'
import { DirectusConfig } from '../config/config'

export class DirectusClient {
  private static instance: DirectusClient
  private logger: Logger
  private client: ReturnType<typeof createDirectus> & RestClient<any> & StaticTokenClient<any>

  // The context of execution is for one environment
  public static getInstance(env: string): DirectusClient {
    if (!DirectusClient.instance) {
      DirectusClient.instance = new DirectusClient(env)
    }
    return DirectusClient.instance
  }

  constructor(env: string) {
    this.logger = Logger.getInstance()
    
    const config = DirectusConfig
      .getInstance()
      .getDirectusConfig(env)

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

  public async readCollections(includeSystem: boolean = false): Promise<Collection[]> {
    try {
      const allCollections = await this.client.request(readCollections())
      
      return includeSystem 
        ? allCollections as Collection[]
        : allCollections.filter(collection => !collection.collection.startsWith('directus_')) as Collection[]
    } catch (exception) {
      this.handleError(exception)
      return []
    }
  }

  public async readFields(includeSystem: boolean = false): Promise<Field[]> {
    try {
      const allFields = await this.client.request(readFields())
      
      return includeSystem 
        ? allFields as Field[]
        : allFields.filter(field => !field.collection.startsWith('directus_')) as Field[]

    } catch (exception) {
      this.handleError(exception)
      return [] 
    }
  }

  public async export(collection: CollectionFields): Promise<string> {
    const id: string = uuidv4()
    const query = { fields: collection.fields }
    try {
      await this.client.request(utilsExport(collection.name, 'csv', {
        fields: query.fields
      }, { id }))
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
      this.logger.log("")
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