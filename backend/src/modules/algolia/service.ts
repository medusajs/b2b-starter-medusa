import { SearchClient, algoliasearch } from "algoliasearch"
import { AlgoliaIndexType, AlgoliaOptions } from "./types"

export default class AlgoliaModuleService {
  private client: SearchClient
  private options: AlgoliaOptions

  constructor({}, options: AlgoliaOptions) {
    this.client = algoliasearch(options.appId, options.apiKey)
    this.options = options
  }

  async getIndexName(type: AlgoliaIndexType) {
    switch (type) {
      case "product":
        return this.options.productIndexName
      default:
        throw new Error(`Invalid index type: ${type}`)
    }
  }

  async indexData(
    data: Record<string, unknown>[],
    type: AlgoliaIndexType = "product"
  ) {
    const indexName = await this.getIndexName(type)
    await this.client.saveObjects({
      indexName,
      objects: data.map((item) => ({
        ...item,
        objectID: item.id,
      })),
    })
  }

  async retrieveFromIndex(
    objectIDs: string[],
    type: AlgoliaIndexType = "product"
  ) {
    const indexName = await this.getIndexName(type)
    return await this.client.getObjects<Record<string, unknown>>({
      requests: objectIDs.map((objectID) => ({
        indexName,
        objectID,
      })),
    })
  }

  async deleteFromIndex(
    objectIDs: string[],
    type: AlgoliaIndexType = "product"
  ) {
    const indexName = await this.getIndexName(type)
    await this.client.deleteObjects({
      indexName,
      objectIDs,
    })
  }

  async search(query: string, type: AlgoliaIndexType = "product") {
    const indexName = await this.getIndexName(type)
    return await this.client.search({
      requests: [
        {
          indexName,
          query,
        },
      ],
    })
  }
}