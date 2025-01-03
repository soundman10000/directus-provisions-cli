import * as fs from 'fs'
import JSZip from 'jszip'
import * as path from 'path'
import { readFile } from 'fs/promises'

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

  public async readZipFile(filePath: string): Promise<Buffer> {
    try {
      return await readFile(filePath)
    } catch (error) {
      if (error instanceof Error) {
        process.stdout.write(error.message)
      } else {
        process.stdout.write('An unexpected error occurred:' + error)
      }
      throw error
    }
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