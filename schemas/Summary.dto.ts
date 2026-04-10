import { z } from 'zod'

export const SummaryDaySchema = z.object({
  calories: z.number(),
  exercise_min: z.number()
})

export const SummaryResponseSchema = z.record(z.string(), SummaryDaySchema)

export type SummaryDay = z.infer<typeof SummaryDaySchema>
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>
