import { service } from '@/config/axios/service'
import { config } from '@/config/axios/config'

const { default_headers } = config

export const requestOriginal = (option: any) => {
  const { headersType, headers, ...otherOption } = option
  return service({
    ...otherOption,
    data: option.data ? option.data : option.method != 'get' ? {} : undefined,
    headers: {
      'Content-Type': headersType || default_headers,
      ...headers
    }
  })
}
