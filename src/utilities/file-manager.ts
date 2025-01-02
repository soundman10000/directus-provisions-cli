import * as fs from 'fs'
import JSZip from 'jszip'
import * as path from 'path'

export class FileManager {
  public async writeZipFile(zip: JSZip, fileName: string, outputPath: string): Promise<void> {
    const zipFilePath = path.join(outputPath, fileName)
    
    return new Promise((resolve, reject) => {
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(zipFilePath))
        .once('finish', () => {
          process.stdout.write(`Zip file has been written to ${zipFilePath}\n`)
          resolve()
        })
        .once('error', reject)
    })
  }

  public async streamToUint8Array(stream: ReadableStream): Promise<Uint8Array> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }

    return new Uint8Array(Buffer.concat(chunks))
  }
}