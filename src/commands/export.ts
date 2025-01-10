import { CommandModule } from "yargs"
import { ExportService } from '../service/export-service'
import { FieldService } from '../service/field-service'
import { Logger } from '../logger/logger'
import { delay } from '../utilities/utilities'
import { LoadingAnimation } from "../logger/loading-animation"

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
    const collectionService = new FieldService(argv.env)
    const exportService = new ExportService(argv.env)
    const logger  = Logger.getInstance()
    
    try {
      const fields = await collectionService
        .findCollectionFields()
        .then(x => exportService.exportCollections(x))
    
      const loadingAnimation = new LoadingAnimation()
      try {
        loadingAnimation.start('Giving Directus a minute to catch up')
        await delay(2000)
      } finally {
        loadingAnimation.stop()
      } 
      
      await exportService.downloadFiles(fields, argv.path)

      logger.logSuccess('Export Successfully Completed')

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.logError(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command