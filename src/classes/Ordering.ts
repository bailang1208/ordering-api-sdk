import { ApiResponse } from './ApiResponse'
import { ApiLanguage } from './ApiLanguage'
import { RequestOptionsProps } from '../interfaces/RequestOptionsProps'
import { ApiSystem } from './ApiSystem'
import { ApiUser } from './ApiUser'
import { ApiValidationField } from './ApiValidationField'
import { ApiOrder } from './ApiOrder'
import { ApiBusiness } from './ApiBusiness'

import { ApiConfig } from './ApiConfig'
import { ApiTranslation } from './ApiTranslation'
import { ApiPage } from './ApiPage'
import { ApiCountry } from './ApiCountry'
import { ApiOrderOption } from './ApiOrderOption'
import { ApiCart } from './ApiCart'

interface SettingProps {
  url?: string
  version?: string
  project?: string
  language?: string
  accessToken?: string
  apiKey?: string
}

export class Ordering {
  private url: string
  private version: string
  private project: string
  private language: string
  private accessToken: string
  private apiKey: string
  constructor ({ url = 'https://apiv4.ordering.co', version = 'v400', project = 'demo', language = 'en', accessToken = null, apiKey = null }: SettingProps = {}) {
    this.url = url
    this.version = version
    this.project = project
    this.language = language
    this.accessToken = accessToken
    this.apiKey = apiKey
  }

  get root () {
    return `${this.url}/${this.version}/${this.language}/${this.project}`
  }

  get systemRoot () {
    return `${this.url}/${this.version}`
  }

  setAccessToken (accessToken: string) {
    this.accessToken = accessToken
    return this
  }

  setApiKey (apiKey: string) {
    this.apiKey = apiKey
    return this
  }

  setUrl (url: string) {
    this.url = url
    return this
  }

  setProject (project: string) {
    this.project = project
    return this
  }

  setVersion (version: string) {
    this.version = version
    return this
  }

  setLanguage (language: string) {
    this.language = language
    return this
  }

  users (userId: number = null) {
    return new ApiUser(this, userId)
  }

  orders (orderId: number = null) {
    return new ApiOrder(this, orderId)
  }

  configs (configId: number = null) {
    return new ApiConfig(this, configId)
  }

  businesses (businessId: number | string) {
    return new ApiBusiness(this, businessId)
  }

  validationFields (fieldId: number) {
    return new ApiValidationField(this, fieldId)
  }

  languages (languageId: number) {
    return new ApiLanguage(this, languageId)
  }

  translations (translationId: number) {
    return new ApiTranslation(this, translationId)
  }

  pages (pageId: number) {
    return new ApiPage(this, pageId)
  }

  countries (countryId: number) {
    return new ApiCountry(this, countryId)
  }

  orderOptions (orderOptionId: number) {
    return new ApiOrderOption(this, orderOptionId)
  }

  carts (cartId: number | string) {
    return new ApiCart(this, cartId)
  }

  system () {
    return new ApiSystem(this)
  }

  getRequestProps (options: RequestOptionsProps): [string, any] {
    const root: string = options.system ? this.systemRoot : this.root
    const { query, mode, conditions, headers, ...otherOptions } = options
    /**
     * Parse query
     */
    const _query = query || {}
    if (_query && Object.keys(_query).length > 0) {
      for (const key in _query) {
        _query[key] = typeof _query[key] === 'object' ? JSON.stringify(_query[key]) : _query[key]
      }
    }

    /**
     * Parse params from options and select attributes
     */
    let params: string [] = _query?.params?.split(',') || []
    params = params.concat(options.attributes || [])
    if (params.length > 0) {
      _query.params = params.join(',')
    }
    /**
     * Parse conditions to filter api data
     */
    if (conditions) {
      _query.where = typeof conditions === 'object' ? JSON.stringify(conditions) : conditions
    }
    /**
     * Parse conditions to filter api data
     */
    if (mode) {
      _query.mode = options.mode
    }
    /**
     * Parse headers from options and default
     */
    const authHeaders: any = {}
    if (this.accessToken && !this.apiKey) {
      authHeaders.Authorization = `Bearer ${this.accessToken}`
    }
    if (this.apiKey) {
      authHeaders['X-Api-Key'] = this.apiKey
    }
    /**
     * Create Option Request
     */
    const _options: any = {
      ...otherOptions,
      // validateStatus: status => status < 500,
      params: _query || {},
      headers: Object.assign(authHeaders, headers || {})
    }

    return [root, _options]
  }

  makeRequest (method: string, url: string, data: any, options: any) {
    const promise = new Promise(function (resolve, reject) {
      const xhr = new window.XMLHttpRequest()

      /**
       * Parse query to request
       */
      const query = Object.entries(options.params || {}).map((entry: any) => {
        return `${entry[0]}=${entry[1]}`
      }).join('&')
      xhr.open(method, url + (query ? `?${query}` : ''))
      /**
       * Add headers to request
       */
      Object.entries(options.headers || {}).forEach((entry: any) => {
        xhr.setRequestHeader(entry[0], entry[1])
      })
      /**
       * Create cancel request
       */
      if (options.cancelToken && typeof options.cancelToken === 'object') {
        options.cancelToken.cancel = () => {
          xhr.abort()
        }
      }
      xhr.onload = function () {
        if (this.status < 500) {
          const data = options.json ? JSON.parse(this.response) : this.response
          resolve({
            request: this,
            data,
            status: this.status,
            statusText: this.statusText
          })
        } else {
          reject(new Error('Internal error'))
        }
      }
      xhr.onerror = function (err) {
        reject(err)
      }
      if (options.json) {
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(data ? JSON.stringify(data) : null)
      } else {
        xhr.send()
      }
    })

    return promise
  }

  async get (path: string, options: RequestOptionsProps = { CastClass: null, json: true, system: false }) {
    const [root, reqOptions] = this.getRequestProps(options)

    const response = await this.makeRequest('GET', root + path, null, reqOptions)

    return new ApiResponse(response, options, options.api)
  }

  async post (path: string, data: any = {}, options: RequestOptionsProps = { CastClass: null, json: true, system: false }) {
    const [root, reqOptions] = this.getRequestProps(options)

    if (options.json) {
      for (const key in data) {
        if (data[key] !== null && typeof data[key] === 'object') {
          data[key] = JSON.stringify(data[key])
        }
      }
    }

    const response = await this.makeRequest('POST', root + path, data, reqOptions)
    return new ApiResponse(response, options, options.api)
  }

  async put (path: string, data: any = {}, options: RequestOptionsProps = { CastClass: null, json: true, system: false }) {
    const [root, reqOptions] = this.getRequestProps(options)

    if (options.json) {
      for (const key in data) {
        if (data[key] !== null && typeof data[key] === 'object') {
          data[key] = JSON.stringify(data[key])
        }
      }
    }

    const response = await this.makeRequest('PUT', root + path, data, reqOptions)
    return new ApiResponse(response, options, options.api)
  }

  async delete (path: string, options: RequestOptionsProps = { CastClass: null, json: true, system: false }) {
    const [root, reqOptions] = this.getRequestProps(options)

    const response = await this.makeRequest('DELETE', root + path, null, reqOptions)
    return new ApiResponse(response, options, options.api)
  }
}
