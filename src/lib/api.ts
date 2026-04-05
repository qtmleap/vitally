import type { ExerciseRow, FoodRow, MealWithFood } from '@/lib/db'
import type { ExerciseInput, FoodInput, MealInput, MealUpdateInput } from '@/lib/schema'

const json = <T>(res: Response): Promise<T> => {
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
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
  }
}
