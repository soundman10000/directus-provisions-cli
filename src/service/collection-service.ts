import { DirectusClient } from '../directus-client/directus'
import { toCollectionsModel, orderCollectionsByForeignKey } from './collection-service.model'

export class CollectionService {
  private client: DirectusClient
  
  constructor(env: string) {
    this.client = DirectusClient.getInstance(env)
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