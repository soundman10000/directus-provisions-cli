import { CommandModule } from "yargs"
import { ImportService } from '../service/import-service'
import { Logger } from '../logger/logger'

const command: CommandModule = {
  command: 'import',
  describe: 'Import Client Directus Provisions',
  handler: async (argv) => {
    const importService = new ImportService()
    const logger = Logger.getInstance()

    const path = "C:/users/jmalley/desktop/button.zip"

    try {
      await importService.importCollections(path)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.logError(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command