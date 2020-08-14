import { ApiResponse } from './ApiResponse'
import { Ordering } from './Ordering'
import { RequestOptionsProps } from '../interfaces/RequestOptionsProps'
import { ApiBase, ApiBaseInterface } from './ApiBase'
import { Category, CategoryProps } from '../models/Category'

/**
 * Class to category api control
 */
export class ApiCategory extends ApiBase implements ApiBaseInterface {
  public businessId: number
  public categoryId: number

  constructor (ordering: Ordering, businessId: number, categoryId: number = null) {
    super(ordering)
    this.ordering = ordering
    this.businessId = businessId
    this.categoryId = categoryId
  }

  /**
   * Replace current modelId
   * @param id ID to replace current api modelId
   */
  setModelId (id: number) {
    this.categoryId = id
  }

  /**
   * Get a category if categoryId is set else get all
   * @param {RequestOptionsProps} options Params, headers and other options
   */
  async get (options: RequestOptionsProps = {}) {
    if (!this.businessId) {
      throw new Error('You must provide the `businessId` param. Example ordering.businesses(businessId).categories(categoryId?).get()')
    }
    if (this.categoryId && this.conditions.length > 0) {
      throw new Error('The `where` function is not compatible with businesses(businessId).categories(categoryId). Example ordering.businesses(businessId).categories().where(contitions).get()')
    }
    const url = `/business/${this.businessId}/categories` + (this.categoryId ? `/${this.categoryId}` : '')
    const response: ApiResponse = await this.makeRequest('GET', url, undefined, Category, options)
    return response
  }

  /**
   * Update a category if categoryId is set else create category
   * @param {CategoryProps} category Attributes to create or update category
   * @param {RequestOptionsProps} options Params, headers and other options
   */
  async save (category: CategoryProps, options: RequestOptionsProps = {}) {
    if (!this.businessId) {
      throw new Error('You must provide the `businessId` param. Example ordering.businesses(businessId).categories(categoryId?).save(changes)')
    }
    const url = `/business/${this.businessId}/categories` + (this.categoryId ? `/${this.categoryId}` : '')
    const response: ApiResponse = await this.makeRequest('POST', url, category, Category, options)
    const { content: { error, result } } = response
    if (!error && !this.categoryId) {
      this.categoryId = result.id
    }
    return response
  }

  /**
   * Delete a category by categoryId
   * @param {RequestOptionsProps} options Params, headers and other options
   */
  async delete (options: RequestOptionsProps = {}) {
    if (!this.businessId) {
      throw new Error('`businessId` is require to delete. Example: ordering.businesses(businessId).categories(categoryId).delete()')
    }
    if (!this.categoryId) {
      throw new Error('`categoryId` is require to delete. Example: ordering.businesses(businessId).categories(categoryId).delete()')
    }

    const url = `/business/${this.businessId}/categories/${this.categoryId}`
    const response: ApiResponse = await this.makeRequest('DELETE', url, undefined, Category, options)
    return response
  }
}
