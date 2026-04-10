import { z } from 'zod'

export const UserProfileRowSchema = z.object({
  age: z.number(),
  heightCm: z.number(),
  weightKg: z.number(),
  bodyFatPct: z.number().nullable(),
  gender: z.string(),
  activityLevel: z.string(),
  goals: z.array(z.string()),
  calorieGoal: z.number(),
  aiAdviceModel: z.string().nullable(),
  aiUtilityModel: z.string().nullable()
})

export type UserProfileRow = z.infer<typeof UserProfileRowSchema>
