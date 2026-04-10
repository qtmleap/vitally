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
  /** 1リクエストあたりの概算 neurons（500 input + 256 output トークン想定） */
  neuronsPerReq: number
  rating: AiModelRating
}

const ALL_CATEGORIES: AiCategory[] = ['advice', 'nutrition', 'exercise']

export const AI_MODELS: AiModel[] = [
  // --- Free ---
  {
    id: '@cf/meta/llama-3-8b-instruct',
    label: 'Llama 3 8B',
    tier: 'free',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 32,
    rating: { quality: 3, speed: 5 }
  },
  {
    id: '@cf/meta/llama-3.1-8b-instruct',
    label: 'Llama 3.1 8B',
    tier: 'free',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 32,
    rating: { quality: 3, speed: 5 }
  },
  {
    id: '@cf/meta/llama-3.1-8b-instruct-fast',
    label: 'Llama 3.1 8B Fast',
    tier: 'free',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 32,
    rating: { quality: 3, speed: 5 }
  },
  {
    id: '@cf/meta/llama-3.2-11b-vision-instruct',
    label: 'Llama 3.2 11B Vision',
    tier: 'free',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 18,
    rating: { quality: 4, speed: 4 }
  },
  {
    id: '@hf/nousresearch/hermes-2-pro-mistral-7b',
    label: 'Hermes 2 Pro 7B',
    tier: 'free',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 30,
    rating: { quality: 3, speed: 4 }
  },

  // --- Pro ---
  {
    id: '@cf/meta/llama-3.1-70b-instruct',
    label: 'Llama 3.1 70B',
    tier: 'pro',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 66,
    rating: { quality: 5, speed: 2 }
  },
  {
    id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    label: 'Llama 3.3 70B Fast',
    tier: 'pro',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 66,
    rating: { quality: 5, speed: 3 }
  },
  {
    id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    label: 'DeepSeek R1 Distill 32B',
    tier: 'pro',
    categories: ALL_CATEGORIES,
    neuronsPerReq: 136,
    rating: { quality: 5, speed: 2 }
  }
]

export const DEFAULT_ADVICE_MODEL = '@cf/meta/llama-3.1-8b-instruct'
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
