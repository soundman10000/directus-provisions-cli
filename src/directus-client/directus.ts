import { createDirectus, RestClient, readItems, readCollections, rest, utilsExport, readAssetRaw, staticToken, StaticTokenClient } from '@directus/sdk';
import dotenv from 'dotenv';
import { DirectusResponse, Collection } from '../types/directus';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export class DirectusClient {
  private client: ReturnType<typeof createDirectus> & RestClient<any> & StaticTokenClient<any>;

  constructor() {
    if (!process.env.DIRECTUS_URL) {
      throw new Error('DIRECTUS_URL environment variable is not set');
    }

    if (!process.env.DIRECTUS_TOKEN) {
      throw new Error('DIRECTUS_TOKEN environment variable is not set');
    }

    this.client = createDirectus(process.env.DIRECTUS_URL)
      .with(rest())
      .with(staticToken(process.env.DIRECTUS_TOKEN))
  }

  async listItems(collection: string): Promise<any[]> {
    try {
      return await this.client.request(readItems(collection));
    } catch (exception) {
      this.handleError(exception);
    }

    return []
  }

  async readCollections(): Promise<Collection[]> {
    try {
      return await this.client.request(readCollections()).then(z => z as Collection[]);
    } catch (exception) {
      this.handleError(exception);
    }

    return []
  }

  async export(collection: string): Promise<string> {
    const id: string = uuidv4();

    try {
      await this.client.request(utilsExport(collection, 'csv', {}, { id }))
    } catch (exception) {
      this.handleError(exception);
    }

    return id
  }

  async download(id: string): Promise<string> {
    try {
      return await this.client
        .request(readAssetRaw(id))
        .then(this.streamToString)
    } catch (exception) {
      this.handleError(exception);
      throw exception
    }
  }

  private handleError(error: any): void {
    if (this.isDirectusResponse(error)) {
      console.error('Directus API Errors:', error.errors?.map(err => err.message).join(', ') ?? 'No error messages');
    } else {
      console.error('Unexpected Error:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  }

  private isDirectusResponse(error: any): error is DirectusResponse {
    return 'errors' in error && Array.isArray(error.errors);
  }
  
  private async streamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
  
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } catch (exception) {
      this.handleError(exception);
    } finally {
      reader.releaseLock();
    }
  
    return Buffer.concat(chunks).toString('utf-8');
  }
}