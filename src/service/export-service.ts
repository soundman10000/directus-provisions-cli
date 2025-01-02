import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import * as fs from 'fs'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileService } from '../utilities/file-manager'

export class ExportService {
  private client: DirectusClient
  private resilience: Resilience

  constructor() {
    this.client = DirectusClient.getInstance()
    this.resilience = new Resilience(3, 2000)
  }

  async exportCollections(collections: string[]): Promise<{ collection: string, id: string }[]> {
    const loadingAnimation = new LoadingAnimation()
    const fileIds: { collection: string, id: string }[] = []
    
    for (const collection of collections) {
      console.log(`Exporting collection: ${collection}`)

      const id = await this.resilience.execute(() => this.client.export(collection))
      fileIds.push({ collection, id })
    }

    loadingAnimation.start('Giving Directus a minute to catch up')
    await this.delay(2000)
    loadingAnimation.stop()

    return fileIds
  }

  async downloadFiles(collections: { collection: string, id: string }[], path: string): Promise<void> {
    const fileService = new FileService()
    for (const { collection, id } of collections) {
      const fileName = `${path}/${collection}.csv`
      process.stdout.write(`Writing collection ${collection} to ${fileName}`)
      process.stdout.write('\n')

      await this.resilience
        .execute(() => this.client.download(id))
        .then(z => fileService.writeFile(fileName, z))
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}