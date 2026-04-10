import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { mealTemplateUpdateSchema } from '@/lib/schema'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userOrRes = await getAuthUser(request)
    if (userOrRes instanceof Response) return userOrRes
    const user = userOrRes
    const { id } = await params
    const body = await request.json()
    const parsed = mealTemplateUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, items } = parsed.data
    const prisma = getPrisma(env)

    // オーナーシップ確認
    const existing = await prisma.mealTemplate.findFirst({ where: { id, userId: user.uid } })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // items が指定された場合は既存アイテムを削除して再作成
    if (items) {
      await prisma.mealTemplateItem.deleteMany({ where: { templateId: id } })
    }

    const template = await prisma.mealTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(items && {
          items: { create: items.map((i) => ({ foodId: i.food_id, quantity: i.quantity })) }
        })
      },
      include: { items: { include: { food: true } } }
    })

    return Response.json({
      id: template.id,
      name: template.name,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      items: template.items.map((item) => ({
        id: item.id,
        foodId: item.foodId,
        quantity: item.quantity,
        food: {
          id: item.food.id,
          name: item.food.name,
          calories: item.food.calories,
          protein: item.food.protein,
          fat: item.food.fat,
          carbs: item.food.carbs,
          serving: item.food.serving,
          createdAt: item.food.createdAt
        }
      }))
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('PUT /api/templates/[id] error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
