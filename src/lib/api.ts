import { Zodios, type ZodiosPlugin } from '@zodios/core'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { apiDefinition } from './api-contract'

const errorToastPlugin: ZodiosPlugin = {
  name: 'error-toast',
  error: async (_api, _config, error) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const data = error.response?.data as { error?: unknown } | undefined
      const serverMessage = typeof data?.error === 'string' ? data.error : undefined
      const fallback = status === 404 ? 'データが見つかりません' : `通信エラー (${status})`
      toast.error(serverMessage ?? fallback)
    } else {
      toast.error(error.message || '通信エラー')
    }
    throw error
  }
}

export const api = new Zodios('/api', apiDefinition)
api.use(errorToastPlugin)
