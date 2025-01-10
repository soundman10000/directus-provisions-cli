import DirectusClient from '../directus-client/directus'
import { toCollectionsModel, orderCollectionsByForeignKey } from './collection-service.model'

class CollectionService {
  static instance: CollectionService
  private _client: DirectusClient
  
  public static getInstance(client: DirectusClient): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService(client)
    }
    return CollectionService.instance
  }

  private constructor(client: DirectusClient) {
    this._client = client
  }

  async listCollections(): Promise<string[]> {
    return await this._client.readCollections().then(toCollectionsModel)
  }

  async listItems(collection: string): Promise<any[]> {
    return await this._client.listItems(collection)
  }

  async listCollectionsPrecedence(): Promise<string[]> {
    return await this._client.readFields().then(orderCollectionsByForeignKey)
  }
}

export default CollectionService