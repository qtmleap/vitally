import { z } from 'zod'

export const FoodRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
  serving: z.string(),
  createdAt: z.string()
})

export type FoodRow = z.infer<typeof FoodRowSchema>
