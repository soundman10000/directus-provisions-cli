import { CommandModule } from "yargs"
import { ExportService } from '../service/export-service'
import { CollectionService } from '../service/collection-service'
import { LoadingAnimation } from '../logger/loading-animation'

const command: CommandModule = {
  command: 'export',
  describe: 'Export Client Directus Provisions',
  handler: async (argv) => {
    const collectionService = new CollectionService()
    const exportService = new ExportService()
    const loadingAnimation = new LoadingAnimation()

    try {
      const collections = await collectionService.listCollections()
      const preparedFiles = await exportService.exportCollections(collections)

      loadingAnimation.start('Giving Directus a minute to catch up')
      await delay(2000)
      loadingAnimation.stop()

      await exportService.downloadFiles(preparedFiles)

    } catch (error) {
      process.stdout.write('\n')
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error('Command failed:', msg)
    } finally {
      loadingAnimation.stop()
      process.exit(0)
    }
  }
}

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default command