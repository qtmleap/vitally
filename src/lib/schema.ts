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

export const genders = ['male', 'female'] as const
export type Gender = (typeof genders)[number]
export const genderLabels: Record<Gender, string> = { male: '男性', female: '女性' }

export const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const
export type ActivityLevel = (typeof activityLevels)[number]
export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: 'ほぼ運動しない',
  light: '軽い運動 (週1-3回)',
  moderate: '適度な運動 (週3-5回)',
  active: '激しい運動 (週6-7回)',
  very_active: '非常に激しい運動'
}

export const goals = ['lose_weight', 'lose_fat', 'maintain', 'gain_muscle'] as const
export type GoalType = (typeof goals)[number]
export const goalLabels: Record<GoalType, string> = {
  lose_weight: '体重を落とす',
  lose_fat: '体脂肪を減らす',
  maintain: '維持',
  gain_muscle: '筋肉を増やす'
}

export const profileSchema = z.object({
  age: z.number().int().min(10, '10歳以上で入力してください').max(120),
  height_cm: z.number().min(100, '100cm以上で入力してください').max(250),
  weight_kg: z.number().min(30, '30kg以上で入力してください').max(300),
  body_fat_pct: z.number().min(1).max(60).nullable().default(null),
  gender: z.enum(genders),
  activity_level: z.enum(activityLevels),
  goal: z.enum(goals)
})
export type ProfileInput = z.infer<typeof profileSchema>

export type MealTemplateCreateInput = z.infer<typeof mealTemplateCreateSchema>
export type MealCopyInput = z.infer<typeof mealCopySchema>
export type FoodInput = z.infer<typeof foodSchema>
export type MealInput = z.infer<typeof mealSchema>
export type MealUpdateInput = z.infer<typeof mealUpdateSchema>
export type ExerciseInput = z.infer<typeof exerciseSchema>
