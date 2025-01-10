import DirectusClient from '../directus-client/directus'
import Resilience from '../resilience/resilience'
import FileManager from '../utilities/file-manager'
import Logger from '../logger/logger'
import JSZip from 'jszip'
import type { CollectionFields } from '../directus-client/directus.d'

class ExportService {
  static instance: ExportService
  private _client: DirectusClient
  private _logger: Logger
  private _fileManager: FileManager

  public static getInstance(client: DirectusClient, logger: Logger, fileManager: FileManager): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService(client, logger, fileManager)
    }
    return ExportService.instance
  }

  private constructor(client: DirectusClient, logger: Logger, fileManager: FileManager) {
    this._client = client
    this._logger = logger
    this._fileManager = fileManager
  }

  async exportCollections(collections: CollectionFields[]): Promise<{ collection: string, id: string }[]> {
    const fileIds: { collection: string, id: string }[] = []
    for (const collection of collections) {
      this._logger.log(`Exporting collection: ${collection.name}`)

      var resilience = new Resilience(3, 2000)
      const id = await resilience.execute(() => this._client.export(collection))
      fileIds.push({ collection: collection.name, id })
    }

    return fileIds
  }

  async downloadFiles(collections: { collection: string, id: string }[], outputPath: string): Promise<void> {
    const zip = new JSZip()
    
    for (const { collection, id } of collections) {
      this._logger.log(`Adding collection ${collection} to zip`)

      var resilience = new Resilience(3, 2000)
      const file = await resilience.execute(() => this._client.download(id))
        .then(this.streamToUint8Array)

      zip.file(`${collection}.csv`, file)
    }

    await this._fileManager.writeZipFile(zip, 'collections.zip', outputPath)
  }
  
  private async streamToUint8Array(stream: ReadableStream): Promise<Uint8Array> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }

    return new Uint8Array(Buffer.concat(chunks))
  }
}

export default ExportService