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
      
      const collections = await client
        .readCollections()
        .then(toCollectionsModel)
        .then(z => z as Collection[]);

      collections.map(x => console.log(x))
    } catch (error) {
      console.error('Command failed:', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      process.exit(0);
    }
  }
}

const filterSystemCollections = (collection: Collection[]): Collection[] => 
  collection?.filter(z => !z.collection.startsWith('directus_')) ?? []

const filterFolders = (collection: Collection[]): Collection[] => 
  collection.filter(z => z.schema != null)

const pullCollection = (collection: Collection[]): string[] =>
  collection.map(z => z.collection)

const toCollectionsModel = pipe(
  filterSystemCollections,
  filterFolders,
  pullCollection
);

export default command