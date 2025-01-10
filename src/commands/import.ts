import { CommandModule } from "yargs"
import { ImportService } from '../service/import-service'
import { CollectionService } from "../service/collection-service"
import { Logger } from '../logger/logger'

interface CommandArgs {
  env: string
  path: string
}

const command: CommandModule<{}, CommandArgs> = {
  command: 'import [env] [path]',
  describe: 'Import Client Directus Provisions',
  builder: (yargs) => {
    return yargs
      .positional('env', {
        describe: 'The environment to use',
        type: 'string',
        demandOption: true
      })
      .positional('path', {
        describe: 'Path of the file',
        type: 'string',
        demandOption: true
      })
  },
  handler: async (argv: CommandArgs) => {
    const logger = Logger.getInstance()
    const importService = new ImportService(argv.env)
    const precedenceService = new CollectionService(argv.env)
    
    try {
      await precedenceService
        .listCollectionsPrecedence()
        .then(o => importService.importCollections(argv.path, o))

      logger.logSuccess('Import Successfully Completed')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.logError(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command