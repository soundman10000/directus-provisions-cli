import { DirectusClient } from '../directus-client/directus'
import type { Collection } from '../types/directus'
import { pipe } from '../fp/composition'

export class CollectionService {
  private client: DirectusClient

  constructor() {
    this.client = DirectusClient.getInstance()
  }

  async listCollections(): Promise<string[]> {
    process.stdout.write('Reading Collections on Directus')
    process.stdout.write('\n')
    return await this.client.readCollections().then(toCollectionsModel)
  }

  async listItems(collection: string): Promise<any[]> {
    return await this.client.listItems(collection)
  }
}

const filterSystemCollections = (collection: Collection[]): Collection[] => 
  collection.filter(z => !z.collection.startsWith('directus_'))

const filterFolders = (collection: Collection[]): Collection[] => 
  collection.filter(z => z.schema != null)

const pullCollection = (collection: Collection[]): string[] =>
  collection.map(z => z.collection)

const toCollectionsModel = pipe(
  filterSystemCollections,
  filterFolders,
  pullCollection
) as (collections: Collection[]) => string[]