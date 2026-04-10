import { makeApi } from '@zodios/core'
import { z } from 'zod'

import { AdviceResponseSchema, ExerciseEstimateSchema, NutritionEstimateSchema } from '../../schemas/Ai.dto'
import { BarcodeResultSchema } from '../../schemas/Barcode.dto'
import { ExerciseRowSchema } from '../../schemas/Exercise.dto'
import { FoodRowSchema } from '../../schemas/Food.dto'
import { MealWithFoodSchema } from '../../schemas/Meal.dto'
import { UserProfileRowSchema } from '../../schemas/Profile.dto'
import { SummaryResponseSchema } from '../../schemas/Summary.dto'
import { MealTemplateRowSchema } from '../../schemas/Template.dto'
import {
  exerciseSchema,
  foodSchema,
  mealCopySchema,
  mealSchema,
  mealTemplateCreateSchema,
  mealTemplateUpdateSchema,
  mealUpdateSchema,
  profileSchema
} from './schema'

export const apiDefinition = makeApi([
  // --- Foods ---
  {
    method: 'get',
    path: '/foods',
    alias: 'listFoods',
    response: z.array(FoodRowSchema),
    parameters: [
      { name: 'q', type: 'Query', schema: z.string().optional() },
      { name: 'limit', type: 'Query', schema: z.number().optional() }
    ]
  },
  {
    method: 'post',
    path: '/foods',
    alias: 'createFood',
    response: FoodRowSchema,
    parameters: [{ name: 'body', type: 'Body', schema: foodSchema }]
  },
  {
    method: 'delete',
    path: '/foods',
    alias: 'deleteFood',
    response: z.object({ ok: z.boolean() }),
    parameters: [{ name: 'id', type: 'Query', schema: z.string() }]
  },
  {
    method: 'get',
    path: '/foods/frequent',
    alias: 'listFrequentFoods',
    response: z.array(FoodRowSchema),
    parameters: [{ name: 'limit', type: 'Query', schema: z.number().optional() }]
  },

  // --- Meals ---
  {
    method: 'get',
    path: '/meals',
    alias: 'listMeals',
    response: z.array(MealWithFoodSchema),
    parameters: [{ name: 'date', type: 'Query', schema: z.string() }]
  },
  {
    method: 'post',
    path: '/meals',
    alias: 'createMeal',
    response: MealWithFoodSchema,
    parameters: [{ name: 'body', type: 'Body', schema: mealSchema }]
  },
  {
    method: 'delete',
    path: '/meals',
    alias: 'deleteMeal',
    response: z.object({ ok: z.boolean() }),
    parameters: [{ name: 'id', type: 'Query', schema: z.string() }]
  },
  {
    method: 'get',
    path: '/meals/:id',
    alias: 'getMeal',
    response: MealWithFoodSchema,
    parameters: [{ name: 'id', type: 'Path', schema: z.string() }]
  },
  {
    method: 'put',
    path: '/meals/:id',
    alias: 'updateMeal',
    response: MealWithFoodSchema,
    parameters: [
      { name: 'id', type: 'Path', schema: z.string() },
      { name: 'body', type: 'Body', schema: mealUpdateSchema }
    ]
  },
  {
    method: 'post',
    path: '/meals/copy',
    alias: 'copyMeals',
    response: z.object({ count: z.number() }),
    parameters: [{ name: 'body', type: 'Body', schema: mealCopySchema }]
  },

  // --- Exercises ---
  {
    method: 'get',
    path: '/exercises',
    alias: 'listExercises',
    response: z.array(ExerciseRowSchema),
    parameters: [{ name: 'date', type: 'Query', schema: z.string() }]
  },
  {
    method: 'post',
    path: '/exercises',
    alias: 'createExercise',
    response: ExerciseRowSchema,
    parameters: [{ name: 'body', type: 'Body', schema: exerciseSchema }]
  },
  {
    method: 'delete',
    path: '/exercises',
    alias: 'deleteExercise',
    response: z.object({ ok: z.boolean() }),
    parameters: [{ name: 'id', type: 'Query', schema: z.string() }]
  },

  // --- AI ---
  {
    method: 'post',
    path: '/ai',
    alias: 'getAdvice',
    response: AdviceResponseSchema,
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          meals: z.array(
            z.object({ food_name: z.string(), calories: z.number(), meal_type: z.string(), quantity: z.number() })
          ),
          exercises: z.array(z.object({ name: z.string(), duration_min: z.number(), calories: z.number().nullable() })),
          date: z.string()
        })
      }
    ]
  },
  {
    method: 'post',
    path: '/ai/nutrition',
    alias: 'estimateNutrition',
    response: NutritionEstimateSchema,
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ name: z.string(), serving: z.string().optional(), save: z.boolean().optional() })
      }
    ]
  },
  {
    method: 'post',
    path: '/ai/exercise',
    alias: 'estimateExercise',
    response: ExerciseEstimateSchema,
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ name: z.string(), duration_min: z.number() })
      }
    ]
  },

  // --- Summary ---
  {
    method: 'get',
    path: '/summary',
    alias: 'getMonthlySummary',
    response: SummaryResponseSchema,
    parameters: [
      { name: 'from', type: 'Query', schema: z.string() },
      { name: 'to', type: 'Query', schema: z.string() }
    ]
  },

  // --- Barcode ---
  {
    method: 'get',
    path: '/barcode',
    alias: 'lookupBarcode',
    response: BarcodeResultSchema,
    parameters: [{ name: 'code', type: 'Query', schema: z.string() }]
  },

  // --- Profile ---
  {
    method: 'get',
    path: '/profile',
    alias: 'getProfile',
    response: z.object({ profile: UserProfileRowSchema.nullable() })
  },
  {
    method: 'put',
    path: '/profile',
    alias: 'updateProfile',
    response: z.object({ profile: UserProfileRowSchema }),
    parameters: [{ name: 'body', type: 'Body', schema: profileSchema }]
  },
  {
    method: 'put',
    path: '/profile/ai-model',
    alias: 'updateAiModels',
    response: z.object({ profile: UserProfileRowSchema }),
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ aiAdviceModel: z.string().optional(), aiUtilityModel: z.string().optional() })
      }
    ]
  },

  // --- Templates ---
  {
    method: 'get',
    path: '/templates',
    alias: 'listTemplates',
    response: z.array(MealTemplateRowSchema)
  },
  {
    method: 'post',
    path: '/templates',
    alias: 'createTemplate',
    response: MealTemplateRowSchema,
    parameters: [{ name: 'body', type: 'Body', schema: mealTemplateCreateSchema }]
  },
  {
    method: 'put',
    path: '/templates/:id',
    alias: 'updateTemplate',
    response: MealTemplateRowSchema,
    parameters: [
      { name: 'id', type: 'Path', schema: z.string() },
      { name: 'body', type: 'Body', schema: mealTemplateUpdateSchema }
    ]
  },
  {
    method: 'delete',
    path: '/templates',
    alias: 'deleteTemplate',
    response: z.object({ ok: z.boolean() }),
    parameters: [{ name: 'id', type: 'Query', schema: z.string() }]
  }
])
