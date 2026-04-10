import { Zodios } from '@zodios/core'
import axios from 'axios'
import { toast } from 'sonner'

import { apiDefinition } from './api-contract'

const axiosInstance = axios.create()

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const serverMessage =
      typeof error.response?.data?.error === 'string' ? (error.response.data.error as string) : undefined
    const fallback = status === 404 ? 'データが見つかりません' : `通信エラー (${status})`
    toast.error(serverMessage ?? fallback)
    return Promise.reject(error)
  }
)

export const api = new Zodios('/api', apiDefinition, { axiosInstance })
