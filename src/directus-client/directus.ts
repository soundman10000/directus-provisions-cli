import { createDirectus, authentication, RestClient, AuthenticationClient, readItems } from '@directus/sdk';
import { rest } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

export class DirectusClient {
  private client: ReturnType<typeof createDirectus> & RestClient<any> & AuthenticationClient<any>;

  constructor() {
    this.client = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
      .with(rest())
      .with(authentication('json'));
  }

  async listItems(collection: string): Promise<void> {
    try {
      await this.client.login(process.env.DIRECTUS_USER ?? '', process.env.DIRECTUS_PASSWORD ?? '');
      const stuff = await this.client.request(readItems(collection));
      console.log(stuff);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      // todo: logout
    }
  }
}