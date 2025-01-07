import { CommandModule } from 'yargs'
import { CollectionService } from '../service/collection-service'
import { Logger } from '../logger/logger'

interface CommandArgs {
  env: string
  collection: string
}

const command: CommandModule<{}, CommandArgs> = {
  command: 'list [env] [collection]',
  describe: 'List items from a collection',
  builder: (yargs) => {
    return yargs
      .positional('env', {
        describe: 'The environment to use',
        type: 'string',
        demandOption: true
      })
      .positional('collection', {
        describe: 'The collection name',
        type: 'string',
        demandOption: true
      })
  },
  handler: async (argv: CommandArgs) => {
    const logger = Logger.getInstance()
    const collectionService = new CollectionService(argv.env)
    
    try {
      const items = await collectionService.listItems(argv.collection)
      logger.log(JSON.stringify(items, null, 2))
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.log(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command