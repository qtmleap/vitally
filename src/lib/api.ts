import type { ExerciseRow, FoodRow, MealWithFood } from '@/lib/db'
import type { ExerciseInput, FoodInput, MealInput } from '@/lib/schema'

const json = (res: Response) => {
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  foods: {
    list: (q?: string): Promise<FoodRow[]> => fetch(`/api/foods${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(json),
    create: (data: FoodInput): Promise<FoodRow> =>
      fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(json),
    delete: (id: string): Promise<void> => fetch(`/api/foods?id=${id}`, { method: 'DELETE' }).then(json)
  },
  meals: {
    list: (date: string): Promise<MealWithFood[]> => fetch(`/api/meals?date=${date}`).then(json),
    create: (data: MealInput): Promise<MealWithFood> =>
      fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(json),
    delete: (id: string): Promise<void> => fetch(`/api/meals?id=${id}`, { method: 'DELETE' }).then(json)
  },
  exercises: {
    list: (date: string): Promise<ExerciseRow[]> => fetch(`/api/exercises?date=${date}`).then(json),
    create: (data: ExerciseInput): Promise<ExerciseRow> =>
      fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(json),
    delete: (id: string): Promise<void> => fetch(`/api/exercises?id=${id}`, { method: 'DELETE' }).then(json)
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
      }).then(json)
  }
}
