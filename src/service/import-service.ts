import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import { Logger } from '../logger/logger'
import JSZip from 'jszip'

export class ImportService {
  private _client: DirectusClient
  private _fileManager: FileManager
  private _logger: Logger
  static instance: ImportService
  
  public static getInstance(client: DirectusClient, logger: Logger, fileManager: FileManager): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService(client, logger, fileManager)
    }
    return ImportService.instance
  }

  private constructor(client: DirectusClient, logger: Logger, fileManager: FileManager) { 
    this._client = client
    this._logger = logger
    this._fileManager = fileManager
  }

  public async importCollections(filePath: string, collectionOrder: string[]): Promise<void> {
    try {
      const data = await this._fileManager
        .readZipFile(filePath)
        .then(JSZip.loadAsync)
  
      for (const collection of collectionOrder) {
        const filename = `${collection}.csv`
        const file = data.files[filename]
        if (file) {
          await this.uploadFile(file, collection)
        } else {
          this._logger.logError(`File ${filename} not found in the archive.`)
        }
      }
    } catch (error) {
      const msg = error instanceof Error 
        ? 'Error importing collections: ' + error.message 
        : JSON.stringify(error)
  
      this._logger.logError('\n' + msg)
    }
  }
  
  private async uploadFile(file: JSZip.JSZipObject, collection: string): Promise<void> {
    if (file.dir) { 
      return
    }

    this._logger.log(`Reading file ${collection}.csv`)

    const contentBlob = await file.async('text')
      .then(z => new Blob([z], { type: 'text/csv' }))

    const formData = new FormData()
    formData.append('file', contentBlob, collection)

    const loadingAnimation = new LoadingAnimation()
    // Importing can take a long time.
    const resilience = new Resilience(1, -1)
    try {
      loadingAnimation.start(`Uploading collection ${collection}..`)
      await resilience.execute(() => this._client.upload(collection, formData))
    } finally {
      loadingAnimation.stop()  
    }

    this._logger.log(`Loaded collection ${collection}`)
  }
}