import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@/generated/prisma/client/edge'

export function getPrisma(env: Cloudflare.Env) {
  const adapter = new PrismaD1(env.DB)
  return new PrismaClient({ adapter })
}

export type { ExerciseRow } from '../../schemas/Exercise.dto'
// フロントエンド API レスポンス型 — schemas/*.dto.ts から再エクスポート
export type { FoodRow } from '../../schemas/Food.dto'
export type { MealWithFood } from '../../schemas/Meal.dto'
export type { UserProfileRow } from '../../schemas/Profile.dto'
export type { MealTemplateItemRow, MealTemplateRow } from '../../schemas/Template.dto'
