import { DirectusClient } from '../directus-client/directus'
import type { Field, CollectionFields } from '../types/directus'
import { Logger } from '../logger/logger'
import { pipe } from '../fp/composition'

type GroupedFields = {
  [key: string]: {
    name: string
    fields: string[]
  }
}

export class FieldService {
  private client: DirectusClient
  private logger: Logger

  constructor(env: string) {
    this.client = DirectusClient.getInstance(env)
    this.logger = Logger.getInstance()
  }

  async listFields(): Promise<CollectionFields[]> {
    this.logger.log('Reading Fields on Directus')
    return await this.client.readFields().then(toFieldsModel)
  }
}

// These will cause a FK exception in the target if the user does not exist.
// We will be omitting these fields from the export
const systemFields: string[] = [
  "user_created",
  "date_created",
  "user_updated",
  "date_updated"
]

const filterSystemCollections = (collection: Field[]): Field[] => 
  collection.filter(z => !z.collection.startsWith('directus_'))

const filterSystemFields = (collection: Field[]): Field[] => 
  collection.filter(z => !systemFields.includes(z.field))

const toModel = (data: Field[]): CollectionFields[] => {
  const groupedData = data.reduce<GroupedFields>((acc, { collection, field }) => {
    if (!acc[collection]) {
      acc[collection] = { name: collection, fields: [] };
    }
    acc[collection].fields.push(field);
    return acc;
  }, {});

  return Object.values(groupedData) as CollectionFields[]
}

const toFieldsModel = pipe(
  filterSystemCollections,
  filterSystemFields,
  toModel
) as (collections: Field[]) => CollectionFields[]