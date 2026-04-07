import { toast } from 'sonner'

import type { ExerciseRow, FoodRow, MealWithFood } from '@/lib/db'
import type { ExerciseInput, FoodInput, MealInput, MealUpdateInput } from '@/lib/schema'

const json = <T>(res: Response): Promise<T> => {
  if (!res.ok) {
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
    list: (q?: string): Promise<FoodRow[]> =>
      fetch(`/api/foods${q ? `?q=${encodeURIComponent(q)}` : ''}`).then((r) => json<FoodRow[]>(r)),
    create: (data: FoodInput): Promise<FoodRow> =>
      fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<FoodRow>(r)),
    delete: (id: string): Promise<void> =>
      fetch(`/api/foods?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r))
  },
  meals: {
    list: (date: string): Promise<MealWithFood[]> =>
      fetch(`/api/meals?date=${date}`).then((r) => json<MealWithFood[]>(r)),
    get: (id: string): Promise<MealWithFood> =>
      fetch(`/api/meals/${id}`).then((r) => json<MealWithFood>(r)),
    create: (data: MealInput): Promise<MealWithFood> =>
      fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<MealWithFood>(r)),
    update: (id: string, data: MealUpdateInput): Promise<MealWithFood> =>
      fetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<MealWithFood>(r)),
    delete: (id: string): Promise<void> =>
      fetch(`/api/meals?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r))
  },
  exercises: {
    list: (date: string): Promise<ExerciseRow[]> =>
      fetch(`/api/exercises?date=${date}`).then((r) => json<ExerciseRow[]>(r)),
    create: (data: ExerciseInput): Promise<ExerciseRow> =>
      fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<ExerciseRow>(r)),
    delete: (id: string): Promise<void> =>
      fetch(`/api/exercises?id=${id}`, { method: 'DELETE' }).then((r) => json<void>(r))
  },
  ai: {
    getAdvice: (data: {
      meals: Array<{ food_name: string; calories: number; meal_type: string; quantity: number }>
      exercises: Array<{ name: string; duration_min: number; calories: number | null }>
      date: string
    }): Promise<{ message: string }> =>
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<{ message: string }>(r)),
    estimateNutrition: (data: { name: string; serving?: string }): Promise<NutritionEstimate> =>
      fetch('/api/ai/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((r) => json<NutritionEstimate>(r))
  },
  summary: {
    month: (from: string, to: string): Promise<Record<string, { calories: number; exercise_min: number }>> =>
      fetch(`/api/summary?from=${from}&to=${to}`).then((r) =>
        json<Record<string, { calories: number; exercise_min: number }>>(r)
      )
  },
  barcode: {
    lookup: (code: string): Promise<BarcodeResult> =>
      fetch(`/api/barcode?code=${encodeURIComponent(code)}`).then((r) => json<BarcodeResult>(r))
  }
}
