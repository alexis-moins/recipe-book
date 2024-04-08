import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, HttpStatusCode } from 'axios'
import IResponse from '../types/IResponse'

export class Fetcher {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  private async makeRequest<T>(options: AxiosRequestConfig): Promise<IResponse<T>> {
    try {
      const response = await axios(options)
      return this.formatResponse<T>(response, true)
    } catch (error_) {
      const error = error_ as any
      // const errorMsg = JSON.parse(error.request.response).message

      return this.handleError<T>(error as AxiosError)
    }
  }

  public async get<T>(
    uri: string,
    params: object = {},
    headers: object = {},
    isAuth = true,
  ): Promise<IResponse<T>> {
    const options: AxiosRequestConfig = {
      url: this.buildURL(uri, params),
      method: 'get',
      headers: this.getFinalHeaders(headers, isAuth),
    }

    return this.makeRequest<T>(options)
  }

  public async post<T>(
    uri: string,
    body: object | string = {},
    headers: object = {},
    isAuth = true,
    isUrlEncoded = true,
  ): Promise<IResponse<T>> {
    const options: AxiosRequestConfig = {
      url: this.buildURL(uri, {}),
      method: 'post',
      headers: this.getFinalHeaders(headers, isAuth),
      data: isUrlEncoded ? new URLSearchParams(Object.entries(body)).toString() : body,
    }

    return this.makeRequest<T>(options)
  }

  public async patch<T>(
    uri: string,
    body: object = {},
    headers: object = {},
    isAuth = true,
    isUrlEncoded = true,
  ): Promise<IResponse<T>> {
    const options: AxiosRequestConfig = {
      url: this.buildURL(uri, {}),
      method: 'patch',
      headers: this.getFinalHeaders(headers, isAuth),
      data: isUrlEncoded ? new URLSearchParams(Object.entries(body)).toString() : body,
    }

    return this.makeRequest<T>(options)
  }

  public async put<T>(
    uri: string,
    body: object = {},
    headers: object = {},
    isAuth = true,
    isUrlEncoded = true,
  ): Promise<IResponse<T>> {
    const options: AxiosRequestConfig = {
      url: this.buildURL(uri, {}),
      method: 'put',
      headers: this.getFinalHeaders(headers, isAuth),
      data: isUrlEncoded ? new URLSearchParams(Object.entries(body)).toString() : body,
    }

    return this.makeRequest<T>(options)
  }

  public async delete<T>(
    uri: string,
    params: object = {},
    headers: object = {},
    isAuth = true,
  ): Promise<IResponse<T>> {
    const options: AxiosRequestConfig = {
      url: this.buildURL(uri, params),
      method: 'delete',
      headers: this.getFinalHeaders(headers, isAuth),
    }

    return this.makeRequest<T>(options)
  }

  private getFinalHeaders(headers: object, isAuth: boolean): object {
    let finalHeaders = { ...headers }

    isAuth = isAuth && this.token !== null

    if (isAuth) {
      finalHeaders = {
        Token: this.token,
        ...headers,
      }
    }
    return finalHeaders
  }

  private buildURL(pathname: string, search: object) {
    return this.url + pathname + this.buildURLParamsFromObject(search)
  }

  private isRequestSuccess = (code: number): boolean => {
    return code >= 200 && code < 300
  }

  private formatResponse<T>(
    axiosResponse: AxiosResponse<any, any>,
    noMessage = false,
  ): IResponse<T> {
    const data = axiosResponse.data.data ?? axiosResponse.data

    if (noMessage) {
      return {
        ok: this.isRequestSuccess(axiosResponse.status),
        code: axiosResponse.status,
        data,
      }
    }

    return {
      ok: this.isRequestSuccess(axiosResponse.status),
      message: axiosResponse.statusText,
      code: axiosResponse.status,
      data,
    }
  }

  private buildURLParamsFromObject(params: object): string {
    if (Object.keys(params).length > 0) {
      const strParams: Record<string, string> = {}
      for (const [key, value] of Object.entries(params)) {
        if (value?.toString()?.length > 0) {
          strParams[key] = value.toString()
        }
      }
      return '?' + new URLSearchParams(strParams).toString()
    }
    return ''
  }

  private handleError<T>(error: AxiosError): Promise<IResponse<T>> {
    const message = ((error?.response?.data as any) ?? { message: '' })?.message

    if (error?.response)
      return Promise.reject({
        message,
        ok: false,
        code: error?.response?.status,
      })
    return Promise.reject({
      message: error?.message,
      ok: false,
      code: HttpStatusCode.InternalServerError,
    })
  }
}
