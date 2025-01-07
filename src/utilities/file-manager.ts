import * as fs from 'fs'
import JSZip from 'jszip'
import * as path from 'path'
import { readFile } from 'fs/promises'
import { Logger } from '../logger/logger'

export class FileManager {
  private logger: Logger
  private static instance: FileManager

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager()
    }
    return FileManager.instance
  }

  constructor() {
    this.logger = Logger.getInstance()
  }

  public async writeZipFile(zip: JSZip, fileName: string, outputPath: string): Promise<void> {
    const zipFilePath = path.join(outputPath, fileName)
    
    return new Promise((resolve, reject) => {
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(zipFilePath))
        .once('finish', () => {
          this.logger.log(`Zip file has been written to ${zipFilePath}`)
          resolve()
        })
        .once('error', reject)
    })
  }

  public async readZipFile(filePath: string): Promise<Buffer> {
    try {
      return await readFile(filePath)
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : JSON.stringify(error)

      this.logger.logError(msg)
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