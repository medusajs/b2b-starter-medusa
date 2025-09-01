import { Logger } from "@medusajs/framework/types"
import algoliasearch, { SearchClient, SearchIndex } from "algoliasearch"

type InjectedDependencies = {
  logger: Logger
}

type ModuleOptions = {
  appId: string
  apiKey: string
  productIndexName: string
}

type AlgoliaRecord = {
  objectID: string
  [key: string]: any
}

export default class AlgoliaModuleService {
  protected logger_: Logger
  protected options_: ModuleOptions
  protected client_: SearchClient
  protected productIndex_: SearchIndex

  constructor(
    { logger }: InjectedDependencies,
    options: ModuleOptions
  ) {
    this.logger_ = logger
    this.options_ = options

    this.client_ = algoliasearch(options.appId, options.apiKey)
    this.productIndex_ = this.client_.initIndex(options.productIndexName)

    this.logger_.info("Algolia module initialized")
  }

  async addDocuments(
    indexName: string,
    documents: AlgoliaRecord[]
  ): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.saveObjects(documents)
      this.logger_.info(
        `Added ${documents.length} documents to index ${indexName}`
      )
    } catch (error) {
      this.logger_.error(
        `Error adding documents to index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async getDocument(
    indexName: string,
    documentId: string
  ): Promise<AlgoliaRecord | null> {
    try {
      const index = this.client_.initIndex(indexName)
      const result = await index.getObject(documentId)
      return result as AlgoliaRecord
    } catch (error) {
      if ((error as any).status === 404) {
        return null
      }
      this.logger_.error(
        `Error getting document ${documentId} from index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async deleteDocument(
    indexName: string,
    documentId: string
  ): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.deleteObject(documentId)
      this.logger_.info(
        `Deleted document ${documentId} from index ${indexName}`
      )
    } catch (error) {
      this.logger_.error(
        `Error deleting document ${documentId} from index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async deleteDocuments(
    indexName: string,
    documentIds: string[]
  ): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.deleteObjects(documentIds)
      this.logger_.info(
        `Deleted ${documentIds.length} documents from index ${indexName}`
      )
    } catch (error) {
      this.logger_.error(
        `Error deleting documents from index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async updateDocument(
    indexName: string,
    document: AlgoliaRecord
  ): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.partialUpdateObject(document)
      this.logger_.info(
        `Updated document ${document.objectID} in index ${indexName}`
      )
    } catch (error) {
      this.logger_.error(
        `Error updating document ${document.objectID} in index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async updateDocuments(
    indexName: string,
    documents: AlgoliaRecord[]
  ): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.partialUpdateObjects(documents)
      this.logger_.info(
        `Updated ${documents.length} documents in index ${indexName}`
      )
    } catch (error) {
      this.logger_.error(
        `Error updating documents in index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async search(
    indexName: string,
    query: string,
    options?: any
  ): Promise<any> {
    try {
      const index = this.client_.initIndex(indexName)
      const result = await index.search(query, options)
      return result
    } catch (error) {
      this.logger_.error(
        `Error searching in index ${indexName}:`,
        error
      )
      throw error
    }
  }

  async clearIndex(indexName: string): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.clearObjects()
      this.logger_.info(`Cleared index ${indexName}`)
    } catch (error) {
      this.logger_.error(`Error clearing index ${indexName}:`, error)
      throw error
    }
  }

  async replaceAllDocuments(
    indexName: string,
    documents: AlgoliaRecord[]
  ): Promise<void> {
    try {
      const index = this.client_.initIndex(indexName)
      await index.replaceAllObjects(documents)
      this.logger_.info(
        `Replaced all documents in index ${indexName} with ${documents.length} new documents`
      )
    } catch (error) {
      this.logger_.error(
        `Error replacing documents in index ${indexName}:`,
        error
      )
      throw error
    }
  }

  getProductIndex(): SearchIndex {
    return this.productIndex_
  }

  getClient(): SearchClient {
    return this.client_
  }
}