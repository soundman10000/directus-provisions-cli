import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import { Logger } from '../logger/logger'
import JSZip from 'jszip'
import { delay } from '../utilities/utilities'

export class ExportService {
  private client: DirectusClient
  private logger: Logger
  private resilience: Resilience
  private loadingAnimation: LoadingAnimation

  constructor() {
    this.client = DirectusClient.getInstance()
    this.resilience = new Resilience(3, 2000)
    this.loadingAnimation = new LoadingAnimation()
    this.logger = Logger.getInstance()
  }

  async exportCollections(collections: string[]): Promise<{ collection: string, id: string }[]> {
    
    const fileIds: { collection: string, id: string }[] = []
    
    for (const collection of collections) {
      this.logger.log(`Exporting collection: ${collection}`)

      const id = await this.resilience.execute(() => this.client.export(collection))
      fileIds.push({ collection, id })
    }

    this.loadingAnimation.start('Giving Directus a minute to catch up')
    await delay(2000)
    this.loadingAnimation.stop()

    return fileIds
  }

  async downloadFiles(collections: { collection: string, id: string }[], outputPath: string): Promise<void> {
    const fileManager = new FileManager()
    const zip = new JSZip()

    for (const { collection, id } of collections) {
      this.logger.log(`Adding collection ${collection} to zip\n`)

      const file = await this.resilience
        .execute(() => this.client.download(id))
        .then(fileManager.streamToUint8Array)

      zip.file(`${collection}.csv`, file)
    }

    await fileManager.writeZipFile(zip, 'collections.zip', outputPath)
  }
}