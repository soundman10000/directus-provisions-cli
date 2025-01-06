import dotenv from 'dotenv'

interface Config {
  directusUrl: string;
  directusToken: string;
}

const getConfig = () : Config => {
  dotenv.config()

  const directusUrl = process.env.DIRECTUS_URL
  const directusToken = process.env.DIRECTUS_TOKEN

  if (!directusUrl || !directusToken) {
    throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN environment variables must be set')
  }

  return {
    directusUrl,
    directusToken
  };
}

export const config = getConfig();