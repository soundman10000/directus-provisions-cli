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

  async listItems(collection: string) {
    // Authenticate first
    await this.client.login(process.env.DIRECTUS_USER ?? '', process.env.DIRECTUS_PASSWORD ?? '');

    // Then fetch items
    return this.client.request(readItems(collection));
  }
}