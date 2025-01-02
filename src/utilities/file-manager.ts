import * as fs from 'fs'
import JSZip from 'jszip'
import * as path from 'path'

export class FileManager {
  public async writeFile(fileName: string, stream: ReadableStream): Promise<void> {
    await this.streamToString(stream).then(data => fs.writeFileSync(fileName, data))
  }

  public async writeZipFile(zip: JSZip, fileName: string, outputPath: string): Promise<void> {
    const zipFilePath = path.join(outputPath, fileName);
    
    return new Promise((resolve, reject) => {
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(zipFilePath))
        .once('finish', () => {
          console.log('Zip file has been written to', zipFilePath);
          resolve();
        })
        .once('error', reject);
    });
  }

  public async streamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
  
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } catch (exception) {
      process.stdout.write('\n')
      const msg = exception instanceof Error ? exception.message : 'An unknown error occurred'
      process.stdout.write(`Command failed: ${msg}`)
    } finally {
      reader.releaseLock();
    }
  
    return Buffer.concat(chunks).toString('utf-8');
  }
}