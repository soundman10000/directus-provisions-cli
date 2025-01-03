import { DirectusClient } from '../directus-client/directus'
import { Resilience } from '../resilience/resilience'
import { LoadingAnimation } from '../logger/loading-animation'
import { FileManager } from '../utilities/file-manager'
import JSZip from 'jszip'
import * as path from 'path';

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

  public async importCollections(filePath: string): Promise<void> {
    try {
      const data = await this.fileManager.readZipFile(filePath).then(JSZip.loadAsync);
  
      for (const fileName in data.files) {
        const file = data.files[fileName];
        if (file.dir) {
          continue;
        }
  
        process.stdout.write(`Reading file ${fileName}\n`);
        const content = await file.async('text');
        const collection = path.parse(fileName).name;
  
        const blob = new Blob([content], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', blob, fileName);
  
        this.loadingAnimation.start(`Uploading file ${fileName}`);
        await this.client.upload(collection, formData);
        this.loadingAnimation.stop();

        process.stdout.write(`Loaded file ${fileName}\n`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error importing collections:', error.message);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  }
}