import { CommandModule } from "yargs"
import { ImportService } from '../service/import-service'

const command: CommandModule = {
  command: 'import',
  describe: 'Import Client Directus Provisions',
  handler: async (argv) => {
    const importService = new ImportService()

    const path = "C:/users/jmalley/desktop/button.zip"

    try {
      await importService.importCollections(path)
    } catch (error) {
      process.stdout.write('\n')
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      process.stdout.write(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command