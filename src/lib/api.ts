import { Zodios, type ZodiosPlugin } from '@zodios/core'
import { toast } from 'sonner'

import { apiDefinition } from './api-contract'

const errorToastPlugin: ZodiosPlugin = {
  name: 'error-toast',
  error: async (_api, _config, error) => {
    const response = (error as { response?: { status?: number; data?: unknown } }).response
    const status = response?.status
    const data = response?.data as { error?: unknown } | undefined
    const serverMessage = typeof data?.error === 'string' ? data.error : undefined
    const fallback = status === 404 ? 'データが見つかりません' : `通信エラー (${status})`
    toast.error(serverMessage ?? fallback)
    throw error
  }
}

export const api = new Zodios('/api', apiDefinition)
api.use(errorToastPlugin)
