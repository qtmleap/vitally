import type { PrismaClient } from '@/generated/prisma/client/edge'
import { today as todayDate } from '@/lib/date'

/**
 * AI リクエストのレート制限チェック＆カウント増加。
 * 上限超過時は false を返す。
 */
export async function checkAndIncrementAiUsage(
  prisma: PrismaClient,
  userId: string,
  dailyLimit: number
): Promise<boolean> {
  const today = todayDate()

  const usage = await prisma.aiUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 }
  })

  return usage.count <= dailyLimit
}
