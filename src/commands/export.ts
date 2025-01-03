import { CommandModule } from "yargs"
import { ExportService } from '../service/export-service'
import { CollectionService } from '../service/collection-service'

const command: CommandModule = {
  command: 'export',
  describe: 'Export Client Directus Provisions',
  handler: async (argv) => {
    const collectionService = new CollectionService()
    const exportService = new ExportService()
    
    const path = "C:/users/jmalley/desktop"

    try {
      const collections = await collectionService
        .listCollections()
        .then(collections => exportService.exportCollections(collections))
        
      await exportService.downloadFiles(collections, path)

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