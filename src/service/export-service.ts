import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import JSZip from 'jszip'

export class ExportService {
  private client: DirectusClient
  private resilience: Resilience
  private loadingAnimation: LoadingAnimation

  constructor() {
    this.client = DirectusClient.getInstance()
    this.resilience = new Resilience(3, 2000)
    this.loadingAnimation = new LoadingAnimation()
  }

  async exportCollections(collections: string[]): Promise<{ collection: string, id: string }[]> {
    
    const fileIds: { collection: string, id: string }[] = []
    
    for (const collection of collections) {
      process.stdout.write(`Exporting collection: ${collection}\n`)

      const id = await this.resilience.execute(() => this.client.export(collection))
      fileIds.push({ collection, id })
    }

    this.loadingAnimation.start('Giving Directus a minute to catch up')
    await this.delay(2000)
    this.loadingAnimation.stop()

    return fileIds
  }

  async downloadFiles(collections: { collection: string, id: string }[], outputPath: string): Promise<void> {
    const fileManager = new FileManager()
    const zip = new JSZip()

    for (const { collection, id } of collections) {
      process.stdout.write(`Adding collection ${collection} to zip\n`)

      const file = await this.resilience
        .execute(() => this.client.download(id))
        .then(fileManager.streamToUint8Array)

      zip.file(`${collection}.csv`, file)
    }

    await fileManager.writeZipFile(zip, 'collections.zip', outputPath)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}