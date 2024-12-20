import { createDirectus, authentication, RestClient, AuthenticationClient, readItems, readCollections  } from '@directus/sdk';
import { rest } from '@directus/sdk';
import dotenv from 'dotenv';
import { DirectusResponse, Collection } from '../types/directus';

dotenv.config();

export class DirectusClient {
  private client: ReturnType<typeof createDirectus> & RestClient<any> & AuthenticationClient<any>;

  constructor() {
    if (!process.env.DIRECTUS_URL) {
      throw new Error('DIRECTUS_URL environment variable is not set');
    }

    this.client = createDirectus(process.env.DIRECTUS_URL)
      .with(rest())
      .with(authentication('json'));
  }

  async listItems(collection: string): Promise<any> {
    try {
      return await this.client.request(readItems(collection));
    } catch (exception) {
      this.handleError(exception);
    }
  }

  async readCollections(): Promise<Collection[]> {
    try {
      return await this.client.request(readCollections()).then(z => z as Collection[]);
    } catch (exception) {
      this.handleError(exception);
      return []
    }
  }

  async login() {
    if (!process.env.DIRECTUS_USER || !process.env.DIRECTUS_PASSWORD) {
      throw new Error('DIRECTUS_USER/DIRECTUS_PASSWORD environment variable is not set');
    }

    try {
      await this.client.login(process.env.DIRECTUS_USER, process.env.DIRECTUS_PASSWORD);
    }
    catch(exception) {
      this.handleError(exception)
    }
  }

  private handleError(error: any): void {
    if (this.isDirectusResponse(error)) {
      console.error('Directus API Errors:', error.errors?.map(err => err.message).join(', ') ?? 'No error messages');
    } else {
      console.error('Unexpected Error:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  }

  isDirectusResponse(error: any): error is DirectusResponse {
    return 'errors' in error && Array.isArray(error.errors);
  }
}