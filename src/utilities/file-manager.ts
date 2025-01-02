import { Readable } from 'stream';
import * as fs from 'fs'

export class FileService {
  async writeFile(fileName: string, stream: ReadableStream): Promise<void> {
    await this.streamToString(stream).then(data => fs.writeFileSync(fileName, data))
  }

  private async streamToString(stream: ReadableStream): Promise<string> {
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