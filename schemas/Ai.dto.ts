import { z } from 'zod'

export const AdviceResponseSchema = z.object({
  message: z.string()
})

export const NutritionEstimateSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
  serving: z.string(),
  // save=true の場合、Food のフィールドも含まれる
  id: z.string().optional(),
  name: z.string().optional(),
  createdAt: z.string().optional()
})

export const ExerciseEstimateSchema = z.object({
  calories: z.number()
})

export type NutritionEstimate = z.infer<typeof NutritionEstimateSchema>
