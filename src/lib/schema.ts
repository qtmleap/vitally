import { z } from 'zod'

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const
export type MealType = (typeof mealTypes)[number]

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食'
}

export const foodSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  calories: z.number().min(0, '0以上で入力してください'),
  protein: z.number().min(0).default(0),
  fat: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  serving: z.string().default('1食分')
})

export const mealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_type: z.enum(mealTypes),
  food_id: z.string().min(1),
  quantity: z.number().min(0.1).default(1)
})

export const exerciseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().min(1, '種目を入力してください'),
  duration_min: z.number().int().min(1, '1分以上で入力してください'),
  calories: z.number().min(0).nullable().default(null)
})

export const mealUpdateSchema = z.object({
  meal_type: z.enum(mealTypes).optional(),
  food_id: z.string().min(1).optional(),
  quantity: z.number().min(0.1).optional()
})

export const mealTemplateItemSchema = z.object({
  food_id: z.string().min(1),
  quantity: z.number().min(0.1).default(1)
})

export const mealTemplateCreateSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  meal_type: z.enum(mealTypes).optional(),
  items: z.array(mealTemplateItemSchema).min(1, '1品目以上追加してください')
})

export const mealCopySchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_type: z.enum(mealTypes).optional()
})

export const aiExerciseEstimateSchema = z.object({
  name: z.string().min(1),
  duration_min: z.number().int().min(1)
})
export type AiExerciseEstimateInput = z.infer<typeof aiExerciseEstimateSchema>

export type MealTemplateCreateInput = z.infer<typeof mealTemplateCreateSchema>
export type MealCopyInput = z.infer<typeof mealCopySchema>
export type FoodInput = z.infer<typeof foodSchema>
export type MealInput = z.infer<typeof mealSchema>
export type MealUpdateInput = z.infer<typeof mealUpdateSchema>
export type ExerciseInput = z.infer<typeof exerciseSchema>
