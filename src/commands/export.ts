import { CommandModule } from "yargs"
import { DirectusClient } from '../directus-client/directus'
import type { Collection } from '../types/directus'
import { pipe } from '../fp/composition'
import * as fs from 'fs';

const command: CommandModule = {
  command: 'export',
  describe: 'Export Client Directus Provisions',
  handler: async (argv) => {
    const client = new DirectusClient()
    try {
      console.log('Reading Collections')

      const collections = await client
        .readCollections()
        .then(toCollectionsModel)

      console.log('Exporting Collections on Directus')

      const id = await client.export(collections[0])
      console.log(`downloaing file ${id}`)

      // Wait for directus to catch up.
      await waitOneSecond()

      const result = await client.download(id)

      fs.writeFileSync(`C:/users/jmalley/desktop/${collections[0]}.csv`, result);

    } catch (error) {
      console.error('Command failed:', error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      process.exit(0)
    }
  }
}

const waitOneSecond = async (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
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