import { z } from 'zod'

export const BarcodeResultSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
  serving: z.string(),
  barcode: z.string()
})

export type BarcodeResult = z.infer<typeof BarcodeResultSchema>
