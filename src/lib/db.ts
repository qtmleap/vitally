import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@/generated/prisma/client/edge'

export function getPrisma(env: Cloudflare.Env) {
  const adapter = new PrismaD1(env.DB)
  return new PrismaClient({ adapter })
}

// フロントエンド API レスポンス型
export interface FoodRow {
  id: string
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  serving: string
  createdAt: string
}

export interface MealWithFood {
  id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_id: string
  quantity: number
  created_at: string
  food_name: string
  food_calories: number
  food_protein: number
  food_fat: number
  food_carbs: number
}

export interface ExerciseRow {
  id: string
  date: string
  name: string
  duration_min: number
  calories: number | null
  createdAt: string
}
