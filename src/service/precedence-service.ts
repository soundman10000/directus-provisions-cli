import { DirectusClient } from '../directus-client/directus'
import { Logger } from '../logger/logger'
import { Field } from '../types/directus'

export class PrecedenceService {
  private client: DirectusClient
  private logger: Logger

  constructor(env: string) {
    this.client = DirectusClient.getInstance(env)
    this.logger = Logger.getInstance()
  }

  async listCollectionsPrecedence(): Promise<string[]> {
    this.logger.log('Reading Collections on Directus')
    
    var data = await this.client.readFields().then(orderCollectionsByForeignKey)
      console.log(data)
      console.log('data has been listed')

    return []
  }

  async listItems(collection: string): Promise<any[]> {
    return await this.client.listItems(collection)
  }
}

function orderCollectionsByForeignKey(fields: Field[]): string[] {
  const collections = new Map<string, Set<string>>();
  const collectionList = new Set<string>();
  const collectionsWithNoDependencies = new Set<string>();

  for (const field of fields) {
    collectionList.add(field.collection);
    if (field.schema && field.schema.foreign_key_table !== null) {
      if (!collections.has(field.schema.foreign_key_table)) {
        collections.set(field.schema.foreign_key_table, new Set());
      }
      collections.get(field.schema.foreign_key_table)!.add(field.collection);
    } else if (!collections.has(field.collection)) {
      collectionsWithNoDependencies.add(field.collection);
    }
  }

  const visited = new Set<string>();
  const result: string[] = [];

  function visit(collection: string) {
    if (visited.has(collection)) {
      return;
    }
    
    visited.add(collection);

    const dependencies = collections.get(collection) || new Set();
    for (const dep of dependencies) {
      visit(dep);
    }
    
    result.push(collection);
  }

  collectionsWithNoDependencies.forEach(collection => {
    if (!visited.has(collection)) {
      visit(collection);
    }
  });

  collectionList.forEach(collection => {
    if (!visited.has(collection)) {
      visit(collection);
    }
  });

  return result.reverse();
}