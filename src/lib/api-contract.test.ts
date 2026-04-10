/// <reference types="@types/bun" />
import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { AdviceResponseSchema, ExerciseEstimateSchema, NutritionEstimateSchema } from '../../schemas/Ai.dto'
import { BarcodeResultSchema } from '../../schemas/Barcode.dto'
import { ExerciseRowSchema } from '../../schemas/Exercise.dto'
import { FoodRowSchema } from '../../schemas/Food.dto'
import { MealWithFoodSchema } from '../../schemas/Meal.dto'
import { UserProfileRowSchema } from '../../schemas/Profile.dto'
import { SummaryResponseSchema } from '../../schemas/Summary.dto'
import { MealTemplateRowSchema } from '../../schemas/Template.dto'

// --- サンプルデータ: 各 API ルートが返す形式を模倣 ---

const sampleFood = {
  id: 'abc123',
  name: 'バナナ',
  calories: 86,
  protein: 1,
  fat: 0,
  carbs: 22,
  serving: '1本',
  createdAt: '2026-04-10T00:00:00.000Z'
}

const sampleMealWithFood = {
  id: 'meal-1',
  date: '2026-04-10',
  meal_type: 'breakfast' as const,
  food_id: 'abc123',
  quantity: 1,
  created_at: '2026-04-10T00:00:00.000Z',
  food_name: 'バナナ',
  food_calories: 86,
  food_protein: 1,
  food_fat: 0,
  food_carbs: 22
}

const sampleExercise = {
  id: 'ex-1',
  date: '2026-04-10',
  name: 'ランニング',
  duration_min: 30,
  calories: 250,
  createdAt: '2026-04-10T00:00:00.000Z'
}

const sampleExerciseNullCalories = {
  id: 'ex-2',
  date: '2026-04-10',
  name: 'ストレッチ',
  duration_min: 15,
  calories: null,
  createdAt: '2026-04-10T00:00:00.000Z'
}

const sampleProfile = {
  age: 30,
  heightCm: 170,
  weightKg: 65,
  bodyFatPct: 15,
  gender: 'male',
  activityLevel: 'moderate',
  goals: ['maintain'],
  calorieGoal: 2000,
  aiAdviceModel: null,
  aiUtilityModel: null
}

const sampleProfileNullBodyFat = {
  ...sampleProfile,
  bodyFatPct: null
}

const sampleTemplate = {
  id: 'tmpl-1',
  name: '朝食セット',
  mealType: 'breakfast',
  createdAt: '2026-04-10T00:00:00.000Z',
  items: [
    {
      id: 'item-1',
      foodId: 'abc123',
      quantity: 1,
      food: sampleFood
    }
  ]
}

const sampleTemplateNullMealType = {
  ...sampleTemplate,
  mealType: null
}

// --- Tests ---

describe('FoodRowSchema', () => {
  test('正常な食品データを受け入れる', () => {
    expect(FoodRowSchema.safeParse(sampleFood).success).toBe(true)
  })

  test('userId を含むデータを拒否する', () => {
    const withUserId = { ...sampleFood, userId: 'user-1' }
    const result = FoodRowSchema.strict().safeParse(withUserId)
    expect(result.success).toBe(false)
  })

  test('必須フィールドが欠けたデータを拒否する', () => {
    const { name: _, ...withoutName } = sampleFood
    expect(FoodRowSchema.safeParse(withoutName).success).toBe(false)
  })

  test('配列レスポンス（GET /api/foods）を検証する', () => {
    const result = z.array(FoodRowSchema).safeParse([sampleFood, { ...sampleFood, id: 'def456' }])
    expect(result.success).toBe(true)
  })
})

describe('MealWithFoodSchema', () => {
  test('正常な食事データを受け入れる', () => {
    expect(MealWithFoodSchema.safeParse(sampleMealWithFood).success).toBe(true)
  })

  test('全ての meal_type を受け入れる', () => {
    for (const type of ['breakfast', 'lunch', 'dinner', 'snack']) {
      const data = { ...sampleMealWithFood, meal_type: type }
      expect(MealWithFoodSchema.safeParse(data).success).toBe(true)
    }
  })

  test('不正な meal_type を拒否する', () => {
    const data = { ...sampleMealWithFood, meal_type: 'brunch' }
    expect(MealWithFoodSchema.safeParse(data).success).toBe(false)
  })

  test('food_ プレフィックス付きフィールドが必須', () => {
    const { food_name: _, ...withoutFoodName } = sampleMealWithFood
    expect(MealWithFoodSchema.safeParse(withoutFoodName).success).toBe(false)
  })

  test('camelCase フィールド (mealType, foodId) を拒否する', () => {
    const prismaStyle = {
      id: 'meal-1',
      date: '2026-04-10',
      mealType: 'breakfast',
      foodId: 'abc123',
      quantity: 1,
      createdAt: '2026-04-10T00:00:00.000Z'
    }
    expect(MealWithFoodSchema.safeParse(prismaStyle).success).toBe(false)
  })
})

describe('ExerciseRowSchema', () => {
  test('正常な運動データを受け入れる', () => {
    expect(ExerciseRowSchema.safeParse(sampleExercise).success).toBe(true)
  })

  test('calories が null でも受け入れる', () => {
    expect(ExerciseRowSchema.safeParse(sampleExerciseNullCalories).success).toBe(true)
  })

  test('duration_min (snake_case) を要求する', () => {
    const camelCase = { ...sampleExercise, durationMin: 30 }
    delete (camelCase as Record<string, unknown>).duration_min
    expect(ExerciseRowSchema.safeParse(camelCase).success).toBe(false)
  })
})

describe('UserProfileRowSchema', () => {
  test('正常なプロフィールを受け入れる', () => {
    expect(UserProfileRowSchema.safeParse(sampleProfile).success).toBe(true)
  })

  test('bodyFatPct が null でも受け入れる', () => {
    expect(UserProfileRowSchema.safeParse(sampleProfileNullBodyFat).success).toBe(true)
  })

  test('goals が配列であること', () => {
    const stringGoals = { ...sampleProfile, goals: 'maintain' }
    expect(UserProfileRowSchema.safeParse(stringGoals).success).toBe(false)
  })

  test('GET /api/profile のラッパー形式を検証する', () => {
    const schema = z.object({ profile: UserProfileRowSchema.nullable() })
    expect(schema.safeParse({ profile: sampleProfile }).success).toBe(true)
    expect(schema.safeParse({ profile: null }).success).toBe(true)
  })
})

describe('MealTemplateRowSchema', () => {
  test('正常なテンプレートを受け入れる', () => {
    expect(MealTemplateRowSchema.safeParse(sampleTemplate).success).toBe(true)
  })

  test('mealType が null でも受け入れる', () => {
    expect(MealTemplateRowSchema.safeParse(sampleTemplateNullMealType).success).toBe(true)
  })

  test('items 内の food が FoodRowSchema に準拠する', () => {
    const badFood = {
      ...sampleTemplate,
      items: [{ id: 'item-1', foodId: 'abc123', quantity: 1, food: { id: 'abc123' } }]
    }
    expect(MealTemplateRowSchema.safeParse(badFood).success).toBe(false)
  })
})

describe('SummaryResponseSchema', () => {
  test('日付キーのレコードを受け入れる', () => {
    const data = {
      '2026-04-01': { calories: 1800, exercise_min: 30 },
      '2026-04-02': { calories: 2100, exercise_min: 0 }
    }
    expect(SummaryResponseSchema.safeParse(data).success).toBe(true)
  })

  test('空オブジェクトを受け入れる', () => {
    expect(SummaryResponseSchema.safeParse({}).success).toBe(true)
  })
})

describe('BarcodeResultSchema', () => {
  test('正常なバーコード結果を受け入れる', () => {
    const data = {
      name: 'コカ・コーラ',
      calories: 45,
      protein: 0,
      fat: 0,
      carbs: 11,
      serving: '100ml',
      barcode: '4902102112345'
    }
    expect(BarcodeResultSchema.safeParse(data).success).toBe(true)
  })
})

describe('AI response schemas', () => {
  test('AdviceResponseSchema', () => {
    expect(AdviceResponseSchema.safeParse({ message: 'よく頑張りましたね！' }).success).toBe(true)
  })

  test('NutritionEstimateSchema — 基本', () => {
    const data = { calories: 86, protein: 1, fat: 0, carbs: 22, serving: '1本' }
    expect(NutritionEstimateSchema.safeParse(data).success).toBe(true)
  })

  test('NutritionEstimateSchema — save=true で Food フィールド付き', () => {
    const data = {
      calories: 86,
      protein: 1,
      fat: 0,
      carbs: 22,
      serving: '1本',
      id: 'food-1',
      name: 'バナナ',
      createdAt: '2026-04-10T00:00:00.000Z'
    }
    expect(NutritionEstimateSchema.safeParse(data).success).toBe(true)
  })

  test('ExerciseEstimateSchema', () => {
    expect(ExerciseEstimateSchema.safeParse({ calories: 250 }).success).toBe(true)
  })
})

describe('DELETE レスポンス', () => {
  const okSchema = z.object({ ok: z.boolean() })

  test('{ ok: true } を受け入れる', () => {
    expect(okSchema.safeParse({ ok: true }).success).toBe(true)
  })

  test('空オブジェクトを拒否する', () => {
    expect(okSchema.safeParse({}).success).toBe(false)
  })
})
