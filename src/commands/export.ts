import { CommandModule } from "yargs"
import { ExportService } from '../service/export-service'
import { CollectionService } from '../service/collection-service'
import { Logger } from '../logger/logger'

interface CommandArgs {
  env: string
  path: string
}

const command: CommandModule<{}, CommandArgs> = {
  command: 'export [env] [path]',
  describe: 'Export Client Directus Provisions',
  builder: (yargs) => {
    return yargs
      .positional('env', {
        describe: 'The environment to use',
        type: 'string',
        demandOption: true
      })
      .positional('path', {
        describe: 'Path to save the file',
        type: 'string',
        demandOption: true
      })
  },
  handler: async (argv: CommandArgs) => {
    const collectionService = new CollectionService(argv.env)
    const exportService = new ExportService(argv.env)
    const logger  = Logger.getInstance()
    
    try {
      const collections = await collectionService
        .listCollections()
        .then(collections => exportService.exportCollections(collections))
        
      await exportService.downloadFiles(collections, argv.path)

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.logError(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command