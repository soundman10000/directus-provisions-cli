import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import * as fs from 'fs'
import { LoadingAnimation } from '../logger/loading-animation'

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

  async downloadFiles(preparedFiles: { collection: string, id: string }[]): Promise<void> {
    for (const { collection, id } of preparedFiles) {
      
      const result = await this.resilience.execute(() => this.client.download(id))

      const fileName = `C:/users/jmalley/desktop/${collection}.csv`
      fs.writeFileSync(fileName, result)
      console.log(`Exported ${collection} to ${fileName}`)
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}