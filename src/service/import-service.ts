import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import { PrecedenceService } from './precedence-service'
import { Logger } from '../logger/logger'
import JSZip from 'jszip'
import * as path from 'path'

export class ImportService {
  private client: DirectusClient
  private resilience: Resilience
  private loadingAnimation: LoadingAnimation
  private fileManager: FileManager
  private logger: Logger
  private precedenceService: PrecedenceService
  
  constructor(env: string) { 
    this.client = DirectusClient.getInstance(env)
    this.logger = Logger.getInstance()
    this.loadingAnimation = new LoadingAnimation()
    this.precedenceService = new PrecedenceService(env)
    this.fileManager = FileManager.getInstance()
    // Importing can take a long time.
    // -1 means no timeout
    this.resilience = new Resilience(1, -1)
  }

  public async importCollections(filePath: string): Promise<void> {
    try {
      const data = await this.fileManager
        .readZipFile(filePath)
        .then(JSZip.loadAsync);
  
      const order = await this.precedenceService.listCollectionsPrecedence();
  
      for (const collection of order) {
        const filename = `${collection}.csv`;
        const file = data.files[filename];
        if (file) {
          await this.uploadFile(file, collection);
        } else {
          this.logger.logError(`File ${filename} not found in the archive.`);
        }
      }
    } catch (error) {
      const msg = error instanceof Error 
        ? 'Error importing collections: ' + error.message 
        : JSON.stringify(error);
  
      this.logger.logError('\n' + msg);
    }
  }
  
  private async uploadFile(file: JSZip.JSZipObject, fileName: string): Promise<void> {
    if (file.dir) { 
      return
    }

    this.logger.log(`Reading file ${fileName}.csv`)

    const collection = path.parse(fileName).name
    const contentBlob = await file.async('text')
      .then(z => new Blob([z], { type: 'text/csv' }))

    const formData = new FormData()
    formData.append('file', contentBlob, fileName)

    this.loadingAnimation.start(`Uploading file ${fileName}..`)
    await this.resilience.execute(() => this.client.upload(collection, formData))
    this.loadingAnimation.stop()

    this.logger.log(`Loaded file ${fileName}`)
  }
}