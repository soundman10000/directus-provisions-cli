import type { Collection, Field } from '../directus-client/directus.d'
import { pipe } from '../fp/composition'

const filterFolders = (collection: Collection[]): Collection[] => 
  collection.filter(z => z.schema != null)

const pullCollection = (collection: Collection[]): string[] =>
  collection.map(z => z.collection)

const toCollectionsModel = pipe(
  filterFolders,
  pullCollection
) as (collections: Collection[]) => string[]

const orderCollectionsByForeignKey = (fields: Field[]): string[] => {
  const collections = new Map<string, Set<string>>()
  const collectionList = new Set<string>()

  for (const field of fields) {
    collectionList.add(field.collection)

    if (field.schema?.foreign_key_table) {
      const currentDeps = collections.get(field.schema.foreign_key_table) || new Set<string>()
      currentDeps.add(field.collection)
      
      collections.set(field.schema.foreign_key_table, currentDeps)
    }
  }

  const result: string[] = []
  const visited = new Set<string>()

  for (const collection of collectionList) {
    visit(collection, collections, visited, result)
  }

  return result.reverse()
}

const visit = (collection: string, collections: Map<string, Set<string>>, visited: Set<string>, result: string[]): void => {
  if (visited.has(collection)) {
    return
  }
  visited.add(collection)

  const dependencies = collections.get(collection)
  if (dependencies) {
    for (const dep of dependencies) {
      visit(dep, collections, visited, result)
    }
  }

  result.push(collection)
}

export { toCollectionsModel, orderCollectionsByForeignKey }