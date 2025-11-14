import { service } from '@/config/axios/service'
import { config } from '@/config/axios/config'

const { default_headers } = config

export const requestOriginal = (option: any) => {
  const { headersType, headers, ...otherOption } = option
  return service({
    ...otherOption,
    headers: {
      'Content-Type': headersType || default_headers,
      ...headers
    }
  })
}
