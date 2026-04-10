import { z } from 'zod'

export const MealWithFoodSchema = z.object({
  id: z.string(),
  date: z.string(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  food_id: z.string(),
  quantity: z.number(),
  created_at: z.string(),
  food_name: z.string(),
  food_calories: z.number(),
  food_protein: z.number(),
  food_fat: z.number(),
  food_carbs: z.number()
})

export type MealWithFood = z.infer<typeof MealWithFoodSchema>
