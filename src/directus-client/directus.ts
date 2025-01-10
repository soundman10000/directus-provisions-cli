import  * as d from '@directus/sdk'

import Logger from '../logger/logger'
import { ProvisionConfig } from '../config/config'
import { v4 as uuidv4 } from 'uuid'
import type { Field, CollectionFields, DirectusResponse, Collection } from './directus.d'

class DirectusClient {
  private static instance: DirectusClient
  private _logger: Logger
  private _client: ReturnType<typeof d.createDirectus> & d.RestClient<any> & d.StaticTokenClient<any>

  public static getInstance(env: string, config: ProvisionConfig): DirectusClient {
    if (!DirectusClient.instance) {
      DirectusClient.instance = new DirectusClient(env, config)
    }
    return DirectusClient.instance
  }

  private constructor(env: string, config: ProvisionConfig) {
    this._logger = Logger.getInstance()
    
    const clientConfig = config.getDirectusConfig(env)

    this._client = d.createDirectus(clientConfig.directusUrl)
      .with(d.rest())
      .with(d.staticToken(clientConfig.directusToken))
  }

  public async listItems(collection: string): Promise<any[]> {
    try {
      return await this._client.request(d.readItems(collection))
    } catch (exception) {
      this.handleError(exception)
    }

    return []
  }

  public async readCollections(includeSystem: boolean = false): Promise<Collection[]> {
    try {
      const allCollections = await this._client.request(d.readCollections())
      
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
      const allFields = await this._client.request(d.readFields())
      
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
      await this._client.request(d.utilsExport(collection.name, 'csv', {
        fields: query.fields
      }, { id }))
    } catch (exception) {
      this.handleError(exception)
    }

    return id
  }

  public async download(id: string): Promise<ReadableStream<Uint8Array>> {
    try {
      return await this._client.request(d.readAssetRaw(id))
    } catch (exception) {
      this.handleError(exception)
      throw exception
    }
  }

  public async upload(collection: string, file: FormData): Promise<void> {
    try {
      await this._client.request(d.utilsImport(collection, file))
    } catch (exception) {
      this.handleError(exception)
      throw exception
    }
  }

  private handleError(error: any): void {
    if (this.isDirectusResponse(error)) {
      this._logger.log("")
      const errorMessage = 'Directus API Errors: ' + (error.errors?.map(err => err.message).join(', ') || 'No error messages')
      this._logger.logError(errorMessage)
    } else {
      const errorText = error instanceof Error ? error.message : JSON.stringify(error)
      this._logger.logError('Unexpected Error: ' + errorText)
    }
  }

  private isDirectusResponse(error: any): error is DirectusResponse {
    return 'errors' in error && Array.isArray(error.errors)
  }
}

export default DirectusClient