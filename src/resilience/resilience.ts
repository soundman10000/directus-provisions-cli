import Logger from '../logger/logger'
import { delay } from '../utilities/utilities'

class Resilience {
  private _retries: number
  private _timeout: number
  private _logger: Logger

  constructor(retries: number = 3, timeout: number = 1000) {
    this._retries = retries
    this._timeout = timeout
    this._logger = Logger.getInstance()
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let attempts = 0
    while (attempts < this._retries) {
      try {
        if (this._timeout === -1) {
          return await fn()
        } else {
          return await this.withTimeout(fn)
        }
      } catch (error) {
        attempts++
        if (attempts >= this._retries) {
          throw error
        }
        this._logger.logError(`\nAttempt ${attempts} failed.`)
        this._logger.log('Retrying...')
        await delay(this._timeout)
      }
    }
    throw new Error('Max retries reached')
  }

  private withTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Operation timed out'))
      }, this._timeout)

      fn().then(
        (result) => {
          clearTimeout(timer)
          resolve(result)
        },
        (error) => {
          clearTimeout(timer)
          reject(error)
        }
      )
    })
  }
}

export default Resilience