import dotenv from 'dotenv'

interface Config {
  directusUrl: string
  directusToken: string
}

interface DirectusUrls {
  [key: string]: string
}

interface DirectusTokens {
  [key: string]: string
}

export class ProvisionConfig {
  private static instance: ProvisionConfig
  private _directusUrls: DirectusUrls
  private _directusTokens: DirectusTokens
  
  public static getInstance(): ProvisionConfig {
    if (!ProvisionConfig.instance) {
      ProvisionConfig.instance = new ProvisionConfig()
    }
    return ProvisionConfig.instance
  }

  constructor() {
    dotenv.config()

    const directusUrl = process.env.DIRECTUS_URL
    const directusToken = process.env.DIRECTUS_TOKEN
  
    if (!directusUrl || !directusToken) {
      throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN environment variables must be set')
    }

    try {
      this._directusUrls = JSON.parse(directusUrl)
      this._directusTokens = JSON.parse(directusToken)
    } catch (error) {
      throw new Error('Invalid JSON in DIRECTUS_URL or DIRECTUS_TOKEN environment variables')
    }
  }

  public getDirectusConfig(env: string): Config {
    const url = this._directusUrls[env]
    const token = this._directusTokens[env]
    if (!url || !token) {
      throw new Error(`Directus configuration for environment ${env} is missing`)
    }

    return {
      directusUrl: this._directusUrls[env],
      directusToken: this._directusTokens[env]
    }
  }
}