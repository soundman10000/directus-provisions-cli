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
  private loadingAnimation: LoadingAnimation
  private fileManager: FileManager
  private logger: Logger
  
  constructor(env: string) { 
    this.client = DirectusClient.getInstance(env)
    this.logger = Logger.getInstance()
    this.resilience = new Resilience(3, 2000)
    this.loadingAnimation = new LoadingAnimation()
    this.fileManager = new FileManager()
  }

  public async importCollections(filePath: string): Promise<void> {
    try {
      const data = await this.fileManager
        .readZipFile(filePath)
        .then(JSZip.loadAsync)

      for (const fileName of Object.keys(data.files)) {
        await this.uploadFile(data.files[fileName], fileName)
      }
    } catch (error) {
      const msg = error instanceof Error 
        ? 'Error importing collections:' + error.message 
        : JSON.stringify(error)
    
      this.logger.logError(msg)
    }
  }
  
  private async uploadFile(file: JSZip.JSZipObject, fileName: string): Promise<void> {
    if (file.dir) { 
      return
    }

    this.logger.log(`Reading file ${fileName}`)

    const collection = path.parse(fileName).name
    const contentBlob = await file.async('text')
      .then(x => [x])
      .then(z => new Blob(z, { type: 'text/csv' }))

    const formData = new FormData()
    formData.append('file', contentBlob, fileName)


    this.loadingAnimation.start(`Uploading file ${fileName}`)
    await this.resilience.execute(() => this.client.upload(collection, formData))
    this.loadingAnimation.stop()

    this.logger.log(`Loaded file ${fileName}`)
  }
}