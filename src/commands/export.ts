import { CommandModule } from "yargs"
import { DirectusClient } from '../directus-client/directus';
import type { Collection } from '../types/directus'
import { pipe } from '../fp/composition'

const command: CommandModule = {
  command: 'export',
  describe: 'Export Client Directus Provisions',
  handler: async (argv) => {
    const client = new DirectusClient();
    try {
      await client.login()
      
      const collections = await client
        .readCollections()
        .then(toCollectionsModel);

      const button = await client.listItems(collections[0])
      console.log(button)
    } catch (error) {
      console.error('Command failed:', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      process.exit(0);
    }
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

export default command