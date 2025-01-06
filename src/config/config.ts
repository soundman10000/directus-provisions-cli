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

export class DirectusConfig {
  private static instance: DirectusConfig
  private directusUrls: DirectusUrls
  private directusTokens: DirectusTokens
  
  public static getInstance(): DirectusConfig {
    if (!DirectusConfig.instance) {
      DirectusConfig.instance = new DirectusConfig()
    }
    return DirectusConfig.instance
  }

  constructor() {
    dotenv.config()

    const directusUrl = process.env.DIRECTUS_URL
    const directusToken = process.env.DIRECTUS_TOKEN
  
    if (!directusUrl || !directusToken) {
      throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN environment variables must be set')
    }

    try {
      this.directusUrls = JSON.parse(directusUrl)
      this.directusTokens = JSON.parse(directusToken)
    } catch (error) {
      throw new Error('Invalid JSON in DIRECTUS_URL or DIRECTUS_TOKEN environment variables')
    }
  }

  public getDirectusConfig(env: string): Config {
    const url = this.directusUrls[env]
    const token = this.directusTokens[env]
    if (!url || !token) {
      throw new Error(`Directus configuration for environment ${env} is missing`)
    }

    return {
      directusUrl: this.directusUrls[env],
      directusToken: this.directusTokens[env]
    }
  }
}