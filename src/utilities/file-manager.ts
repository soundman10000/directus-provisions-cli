import Logger from '../logger/logger'
import JSZip from 'jszip'
import * as fs from 'fs'
import * as path from 'path'
import { readFile } from 'fs/promises'

class FileManager {
  private _logger: Logger
  private static instance: FileManager

  public static getInstance(logger: Logger): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager(logger)
    }
    return FileManager.instance
  }

  constructor(logger: Logger) {
    this._logger = logger
  }

  public async writeZipFile(zip: JSZip, fileName: string, outputPath: string): Promise<void> {
    const zipFilePath = path.join(outputPath, fileName)
    
    return new Promise((resolve, reject) => {
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(zipFilePath))
        .once('finish', () => {
          this._logger.log(`Zip file has been written to ${zipFilePath}`)
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

      this._logger.logError(msg)
      throw error
    }
  }
}

export default FileManager