import { DirectusClient } from '../directus-client/directus'
import type { CollectionFields } from '../directus-client/directus.d'
import { Resilience } from '../resilience/resilience'
import { FileManager } from '../utilities/file-manager'
import { Logger } from '../logger/logger'
import JSZip from 'jszip'

export class ExportService {
  static instance: ExportService
  private client: DirectusClient
  private logger: Logger
  private fileManager: FileManager

  public static getInstance(client: DirectusClient, logger: Logger, fileManager: FileManager): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService(client, logger, fileManager)
    }
    return ExportService.instance
  }

  private constructor(client: DirectusClient, logger: Logger, fileManager: FileManager) {
    this.client = client
    this.logger = logger
    this.fileManager = fileManager
  }

  async exportCollections(collections: CollectionFields[]): Promise<{ collection: string, id: string }[]> {
    const fileIds: { collection: string, id: string }[] = []
    for (const collection of collections) {
      this.logger.log(`Exporting collection: ${collection.name}`)

      var resilience = new Resilience(3, 2000)
      const id = await resilience.execute(() => this.client.export(collection))
      fileIds.push({ collection: collection.name, id })
    }

    return fileIds
  }

  async downloadFiles(collections: { collection: string, id: string }[], outputPath: string): Promise<void> {
    const zip = new JSZip()
    
    for (const { collection, id } of collections) {
      this.logger.log(`Adding collection ${collection} to zip`)

      var resilience = new Resilience(3, 2000)
      const file = await resilience.execute(() => this.client.download(id))
        .then(this.fileManager.streamToUint8Array)

      zip.file(`${collection}.csv`, file)
    }

    await this.fileManager.writeZipFile(zip, 'collections.zip', outputPath)
  }
}