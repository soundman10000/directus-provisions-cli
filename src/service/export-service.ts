import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { FileManager } from '../utilities/file-manager'
import { CollectionFields } from '../types/directus'
import { Logger } from '../logger/logger'
import JSZip from 'jszip'


export class ExportService {
  private client: DirectusClient
  private logger: Logger
  private resilience: Resilience

  constructor(env: string) {
    this.client = DirectusClient.getInstance(env)
    this.resilience = new Resilience(3, 2000)
    this.logger = Logger.getInstance()
  }

  async exportCollections(collections: CollectionFields[]): Promise<{ collection: string, id: string }[]> {
    const fileIds: { collection: string, id: string }[] = []
    for (const collection of collections) {
      this.logger.log(`Exporting collection: ${collection.name}`)

      const id = await this.resilience.execute(() => this.client.export(collection))
      fileIds.push({ collection: collection.name, id })
    }

    return fileIds
  }

  async downloadFiles(collections: { collection: string, id: string }[], outputPath: string): Promise<void> {
    const fileManager = new FileManager()
    const zip = new JSZip()
    
    for (const { collection, id } of collections) {
      this.logger.log(`Adding collection ${collection} to zip`)

      const file = await this.resilience
        .execute(() => this.client.download(id))
        .then(fileManager.streamToUint8Array)

      zip.file(`${collection}.csv`, file)
    }

    await fileManager.writeZipFile(zip, 'collections.zip', outputPath)
  }
}