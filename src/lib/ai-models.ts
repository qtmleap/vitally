export type Tier = 'free' | 'pro'
export type AiCategory = 'advice' | 'nutrition' | 'exercise'

export interface AiModelRating {
  /** 回答の質 (1-5) */
  quality: number
  /** 応答速度 (1-5) */
  speed: number
}

export interface AiModel {
  id: string
  label: string
  tier: Tier
  categories: AiCategory[]
  /** 1リクエストあたりの概算 neurons（表示用） */
  neuronsPerReq: number
  rating: AiModelRating
}

export const AI_MODELS: AiModel[] = [
  // --- Advice ---
  {
    id: '@cf/meta/llama-3.1-8b-instruct-fp8',
    label: 'Llama 3.1 8B',
    tier: 'free',
    categories: ['advice'],
    neuronsPerReq: 14,
    rating: { quality: 3, speed: 5 }
  },
  {
    id: '@cf/qwen/qwen3-30b-a3b-fp8',
    label: 'Qwen3 30B (MoE)',
    tier: 'free',
    categories: ['advice'],
    neuronsPerReq: 11,
    rating: { quality: 4, speed: 4 }
  },
  {
    id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    label: 'Llama 3.3 70B',
    tier: 'pro',
    categories: ['advice'],
    neuronsPerReq: 59,
    rating: { quality: 5, speed: 3 }
  },
  // --- Nutrition / Exercise ---
  {
    id: '@hf/nousresearch/hermes-2-pro-mistral-7b',
    label: 'Hermes 2 Pro 7B',
    tier: 'free',
    categories: ['nutrition', 'exercise'],
    neuronsPerReq: 14,
    rating: { quality: 3, speed: 4 }
  },
  {
    id: '@cf/meta/llama-3.1-8b-instruct-fp8',
    label: 'Llama 3.1 8B',
    tier: 'free',
    categories: ['nutrition', 'exercise'],
    neuronsPerReq: 14,
    rating: { quality: 3, speed: 5 }
  }
]

export const DEFAULT_ADVICE_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'
export const DEFAULT_UTILITY_MODEL = '@hf/nousresearch/hermes-2-pro-mistral-7b'

/** カテゴリに対応するモデル一覧を取得 */
export function getModelsForCategory(category: AiCategory): AiModel[] {
  return AI_MODELS.filter((m) => m.categories.includes(category))
}

/** モデル ID が指定 tier で利用可能か */
export function isModelAllowed(modelId: string, category: AiCategory, userTier: Tier): boolean {
  const model = AI_MODELS.find((m) => m.id === modelId && m.categories.includes(category))
  if (!model) return false
  if (model.tier === 'pro' && userTier === 'free') return false
  return true
}

/** tier ごとの日次リクエスト上限 */
export const DAILY_LIMITS: Record<Tier, number> = {
  free: 20,
  pro: 100
}
