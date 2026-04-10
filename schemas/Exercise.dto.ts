import { z } from 'zod'

export const ExerciseRowSchema = z.object({
  id: z.string(),
  date: z.string(),
  name: z.string(),
  duration_min: z.number(),
  calories: z.number().nullable(),
  createdAt: z.string()
})

export type ExerciseRow = z.infer<typeof ExerciseRowSchema>

export const RecentExerciseSchema = z.object({
  name: z.string()
})

export type RecentExercise = z.infer<typeof RecentExerciseSchema>
