import { CommandModule } from 'yargs'
import { CollectionService } from '../service/collection-service'
import { Logger } from '../logger/logger'

const command: CommandModule = {
  command: 'list [collection]',
  describe: 'List items from a collection',
  builder: (yargs) => {
    return yargs
      .positional('collection', {
        describe: 'The collection name',
        type: 'string',
        demandOption: true
      })
  },
  handler: async (argv) => {
    const logger  = Logger.getInstance()
    const collectionService = new CollectionService()
    
    try {
      const items = await collectionService.listItems(argv.collection as string)
      logger.log(JSON.stringify(items, null, 2) + '\n')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.log(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command