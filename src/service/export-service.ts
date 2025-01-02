import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import * as fs from 'fs'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import * as path from 'path'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

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
      console.log(`Exporting collection: ${collection}`)

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
      console.log(`Adding collection ${collection} to zip`)

      const file = await this.resilience
        .execute(() => this.client.download(id))
        .then(fileManager.streamToString)

      zip.file(`${collection}.csv`, file)
    }

    const zipFilePath = path.join(outputPath, 'collections.zip')
    console.log(zipFilePath, 'Zip File Path')

    await new Promise<void>((resolve, reject) => {
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(zipFilePath))
        .on('finish', () => {
          console.log('Zip file has been written to', zipFilePath)
          resolve()
        })
        .on('error', (error) => {
          console.error('Failed to write zip file:', error)
          reject(error)
        })
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}