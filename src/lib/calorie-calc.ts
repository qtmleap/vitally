export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'lose_weight' | 'lose_fat' | 'maintain' | 'gain_muscle'

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
}

const goalMultipliers: Record<Goal, number> = {
  lose_weight: 0.8,
  lose_fat: 0.9,
  maintain: 1.0,
  gain_muscle: 1.1
}

/** Mifflin-St Jeor 式で目標カロリーを算出 */
export function calculateCalorieGoal(params: {
  age: number
  heightCm: number
  weightKg: number
  gender: Gender
  activityLevel: ActivityLevel
  goals: Goal[]
}): number {
  const bmr =
    params.gender === 'male'
      ? 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age + 5
      : 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age - 161

  const tdee = bmr * activityMultipliers[params.activityLevel]
  const g = params.goals.length > 0 ? params.goals : (['maintain'] as Goal[])
  const avgMultiplier = g.reduce((s, goal) => s + goalMultipliers[goal], 0) / g.length
  return Math.round(tdee * avgMultiplier)
}
