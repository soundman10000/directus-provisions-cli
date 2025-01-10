import { DirectusClient } from '../directus-client/directus'
import { toCollectionsModel, orderCollectionsByForeignKey } from './collection-service.model'

export class CollectionService {
  private client: DirectusClient
  static instance: CollectionService
  
  public static getInstance(client: DirectusClient): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService(client)
    }
    return CollectionService.instance
  }

  private constructor(client: DirectusClient) {
    this.client = client
  }

  async listCollections(): Promise<string[]> {
    return await this.client.readCollections().then(toCollectionsModel)
  }

  async listItems(collection: string): Promise<any[]> {
    return await this.client.listItems(collection)
  }

  async listCollectionsPrecedence(): Promise<string[]> {
    return await this.client.readFields().then(orderCollectionsByForeignKey)
  }
}