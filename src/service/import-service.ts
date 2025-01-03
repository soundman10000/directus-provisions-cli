import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import JSZip from 'jszip'

export class ImportService {
  private client: DirectusClient
  private resilience: Resilience
  private loadingAnimation: LoadingAnimation
  private fileManager: FileManager
  
  constructor() { 
    this.client = DirectusClient.getInstance()
    this.resilience = new Resilience(3, 2000)
    this.loadingAnimation = new LoadingAnimation()
    this.fileManager = new FileManager()
  }

  public async importCollections(path: string): Promise<void> {
    try {
        const data = await this.fileManager
          .readZipFile(path)
          .then(JSZip.loadAsync)

        for (const fileName in data.files) {
          console.log(fileName)
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error importing collections:', error.message)
        } else {
            console.error('An unexpected error occurred:', error)
        }
    }
  }
}