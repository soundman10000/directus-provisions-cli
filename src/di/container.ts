import CollectionService from '../service/collection-service'
import FieldService from '../service/field-service'
import ImportService from '../service/import-service'
import ExportService from '../service/export-service'
import FileManager from '../utilities/file-manager'
import DirectusClient from '../directus-client/directus'
import Logger from '../logger/logger'
import { ProvisionConfig } from '../config/config'

class Container {
  private static instance: Container
  private _env: string

  private constructor(env: string) {
    this._env = env
  }

  public static getInstance(env: string): Container {
    if (!Container.instance) {
      Container.instance = new Container(env)
    }
    return Container.instance
  }

  public getConfig(): ProvisionConfig {
    return ProvisionConfig.getInstance()
  }

  public getDirectusClient(env: string): DirectusClient {
    return DirectusClient.getInstance(env, this.getConfig())
  }

  public getFileManager(): FileManager {
    return FileManager.getInstance(this.getLogger())
  }

  public getLogger(): Logger {
    return Logger.getInstance()
  }

  public getExportService(): ExportService {
    return ExportService.getInstance(
      this.getDirectusClient(this._env),
      this.getLogger(),
      this.getFileManager())
  }

  public getImportService(): ImportService {
    return ImportService.getInstance(
      this.getDirectusClient(this._env),
      this.getLogger(),
      this.getFileManager())
  }

  public getCollectionService(): CollectionService {
    return CollectionService.getInstance(this.getDirectusClient(this._env))
  }

  public getFieldService(): FieldService {
    return FieldService.getInstance(this.getDirectusClient(this._env))
  }
}

export default Container