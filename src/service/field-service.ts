import { DirectusClient } from '../directus-client/directus'
import type { CollectionFields } from '../directus-client/directus.d'
import { toFieldsModel } from './field-service.model'

export class FieldService {
  private client: DirectusClient

  constructor(env: string) {
    this.client = DirectusClient.getInstance(env)
  }

  async findCollectionFields(): Promise<CollectionFields[]> {
    return await this.client.readFields().then(toFieldsModel)
  }
}