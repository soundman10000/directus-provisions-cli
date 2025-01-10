import DirectusClient from '../directus-client/directus'
import type { CollectionFields } from '../directus-client/directus.d'
import { toFieldsModel } from './field-service.model'

class FieldService {
  static instance: FieldService
  private client: DirectusClient

  public static getInstance(client: DirectusClient): FieldService { 
    if (!FieldService.instance) {
      FieldService.instance = new FieldService(client)
    }
    return FieldService.instance
  }

  private constructor(client: DirectusClient) {
    this.client = client
  }

  async findCollectionFields(): Promise<CollectionFields[]> {
    return await this.client.readFields().then(toFieldsModel)
  }
}

export default FieldService