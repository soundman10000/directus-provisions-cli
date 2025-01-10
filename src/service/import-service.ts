import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import { Logger } from '../logger/logger'
import JSZip from 'jszip'
import * as path from 'path'

export class ImportService {
  private client: DirectusClient
  private resilience: Resilience
  private fileManager: FileManager
  private logger: Logger
  
  constructor(env: string) { 
    this.client = DirectusClient.getInstance(env)
    this.logger = Logger.getInstance()
    this.fileManager = FileManager.getInstance()
    // Importing can take a long time.
    // -1 means no timeout
    this.resilience = new Resilience(1, -1)
  }

  public async importCollections(filePath: string, collectionOrder: string[]): Promise<void> {
    try {
      const data = await this.fileManager
        .readZipFile(filePath)
        .then(JSZip.loadAsync)
  
      for (const collection of collectionOrder) {
        const filename = `${collection}.csv`
        const file = data.files[filename]
        if (file) {
          await this.uploadFile(file, collection)
        } else {
          this.logger.logError(`File ${filename} not found in the archive.`)
        }
      }
    } catch (error) {
      const msg = error instanceof Error 
        ? 'Error importing collections: ' + error.message 
        : JSON.stringify(error)
  
      this.logger.logError('\n' + msg)
    }
  }
  
  private async uploadFile(file: JSZip.JSZipObject, collection: string): Promise<void> {
    if (file.dir) { 
      return
    }

    this.logger.log(`Reading file ${collection}.csv`)

    const contentBlob = await file.async('text')
      .then(z => new Blob([z], { type: 'text/csv' }))

    const formData = new FormData()
    formData.append('file', contentBlob, collection)

    const loadingAnimation = new LoadingAnimation()
    try {
      loadingAnimation.start(`Uploading collection ${collection}..`)
      await this.resilience.execute(() => this.client.upload(collection, formData))
    } finally {
      loadingAnimation.stop()  
    }

    this.logger.log(`Loaded collection ${collection}`)
  }
}