import { z } from 'zod'

import { FoodRowSchema } from './Food.dto'

export const MealTemplateItemRowSchema = z.object({
  id: z.string(),
  foodId: z.string(),
  quantity: z.number(),
  food: FoodRowSchema
})

export type MealTemplateItemRow = z.infer<typeof MealTemplateItemRowSchema>

export const MealTemplateRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(MealTemplateItemRowSchema)
})

export type MealTemplateRow = z.infer<typeof MealTemplateRowSchema>
