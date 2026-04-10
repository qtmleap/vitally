import { Zodios } from '@zodios/core'
import axios from 'axios'
import { toast } from 'sonner'

import { apiDefinition } from './api-contract'

const axiosInstance = axios.create()

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status
    if (status === 401) {
      const { signOutUser } = await import('@/lib/auth')
      await signOutUser()
      window.location.href = '/'
      return Promise.reject(error)
    }
    const msg = status === 404 ? 'データが見つかりません' : `通信エラー (${status})`
    toast.error(msg)
    return Promise.reject(error)
  }
)

export const api = new Zodios('/api', apiDefinition, { axiosInstance })
