import { toast } from 'sonner'

import type { ExerciseRow, FoodRow, MealTemplateRow, MealWithFood, UserProfileRow } from '@/lib/db'
import type {
  ExerciseInput,
  FoodInput,
  MealCopyInput,
  MealInput,
  MealTemplateCreateInput,
  MealUpdateInput,
  ProfileInput
} from '@/lib/schema'

let getToken: (() => Promise<string | null>) | null = null

export function setTokenGetter(fn: () => Promise<string | null>) {
  getToken = fn
}

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (getToken) {
    const token = await getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(url, { ...init, headers })
}

const json = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    if (res.status === 401) {
      const { signOutUser } = await import('@/lib/auth')
      await signOutUser()
      window.location.href = '/'
      throw new Error('認証エラー')
    }
    const msg = res.status === 404 ? 'データが見つかりません' : `通信エラー (${res.status})`
    toast.error(msg)
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

interface BarcodeResult {
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  serving: string
  barcode: string
}

interface NutritionEstimate {
  calories: number
  protein: number
  fat: number
  carbs: number
  serving: string
}

export const api = {
  foods: {
    list: (q?: string, limit?: number): Promise<FoodRow[]> => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (limit) params.set('limit', String(limit))
      const qs = params.toString()
      return authFetch(`/api/foods${qs ? `?${qs}` : ''}`).then((r) => json<FoodRow[]>(r))
    },
    create: (data: FoodInput): Promise<FoodRow> =>
      authFetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<FoodRow>(r)),
    delete: (id: string): Promise<void> =>
      authFetch(`/api/foods?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r)),
    frequent: (limit?: number): Promise<FoodRow[]> =>
      authFetch(`/api/foods/frequent${limit ? `?limit=${limit}` : ''}`).then((r) => json<FoodRow[]>(r))
  },
  meals: {
    list: (date: string): Promise<MealWithFood[]> =>
      authFetch(`/api/meals?date=${date}`).then((r) => json<MealWithFood[]>(r)),
    get: (id: string): Promise<MealWithFood> =>
      authFetch(`/api/meals/${id}`).then((r) => json<MealWithFood>(r)),
    create: (data: MealInput): Promise<MealWithFood> =>
      authFetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<MealWithFood>(r)),
    update: (id: string, data: MealUpdateInput): Promise<MealWithFood> =>
      authFetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<MealWithFood>(r)),
    delete: (id: string): Promise<void> =>
      authFetch(`/api/meals?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r)),
    copy: (data: MealCopyInput): Promise<{ count: number }> =>
      authFetch('/api/meals/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<{ count: number }>(r))
  },
  exercises: {
    list: (date: string): Promise<ExerciseRow[]> =>
      authFetch(`/api/exercises?date=${date}`).then((r) => json<ExerciseRow[]>(r)),
    create: (data: ExerciseInput): Promise<ExerciseRow> =>
      authFetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<ExerciseRow>(r)),
    delete: (id: string): Promise<void> =>
      authFetch(`/api/exercises?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r))
  },
  ai: {
    getAdvice: (data: {
      meals: Array<{ food_name: string; calories: number; meal_type: string; quantity: number }>
      exercises: Array<{ name: string; duration_min: number; calories: number | null }>
      date: string
    }): Promise<{ message: string }> =>
      authFetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<{ message: string }>(r)),
    estimateNutrition: (data: { name: string; serving?: string; save?: boolean }): Promise<NutritionEstimate & Partial<FoodRow>> =>
      authFetch('/api/ai/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<NutritionEstimate & Partial<FoodRow>>(r)),
    estimateExercise: (data: { name: string; duration_min: number }): Promise<{ calories: number }> =>
      authFetch('/api/ai/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<{ calories: number }>(r))
  },
  summary: {
    month: (from: string, to: string): Promise<Record<string, { calories: number; exercise_min: number }>> =>
      authFetch(`/api/summary?from=${from}&to=${to}`).then((r) =>
        json<Record<string, { calories: number; exercise_min: number }>>(r)
      )
  },
  barcode: {
    lookup: (code: string): Promise<BarcodeResult> =>
      authFetch(`/api/barcode?code=${encodeURIComponent(code)}`).then((r) => json<BarcodeResult>(r))
  },
  profile: {
    get: (): Promise<{ profile: UserProfileRow | null }> => authFetch('/api/profile').then((r) => json(r)),
    update: (data: ProfileInput): Promise<{ profile: UserProfileRow }> =>
      authFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json(r)),
    updateAiModels: (data: { aiAdviceModel?: string; aiUtilityModel?: string }): Promise<{ profile: UserProfileRow }> =>
      authFetch('/api/profile/ai-model', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json(r))
  },
  templates: {
    list: (): Promise<MealTemplateRow[]> =>
      authFetch('/api/templates').then((r) => json<MealTemplateRow[]>(r)),
    create: (data: MealTemplateCreateInput): Promise<MealTemplateRow> =>
      authFetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<MealTemplateRow>(r)),
    delete: (id: string): Promise<void> =>
      authFetch(`/api/templates?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r))
  }
}
