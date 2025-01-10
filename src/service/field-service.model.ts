import { pipe } from '../fp/composition'
import type { Field, CollectionFields } from '../directus-client/directus.d'

type GroupedFields = {
  [key: string]: {
    name: string
    fields: string[]
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

const fitlerAliases = (collection: Field[]): Field[] => 
  collection.filter(z => z.type != 'alias')

const toModel = (data: Field[]): CollectionFields[] => {
  const groupedData = data.reduce<GroupedFields>((acc, { collection, field }) => {
    if (!acc[collection]) {
      acc[collection] = { name: collection, fields: [] }
    }
    acc[collection].fields.push(field)
    return acc
  }, {})

  return Object.values(groupedData) as CollectionFields[]
}

const toFieldsModel = pipe(
  filterSystemCollections,
  filterSystemFields,
  fitlerAliases,
  toModel
) as (collections: Field[]) => CollectionFields[]

export { toFieldsModel }