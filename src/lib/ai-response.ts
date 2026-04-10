import { z } from 'zod'

/**
 * Workers AI のテキスト生成レスポンススキーマ。
 * llama / hermes 系モデルが返す共通フォーマット。
 */
export const AiTextResponseSchema = z.object({
  response: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number()
    })
    .optional()
})

export type AiTextResponse = z.infer<typeof AiTextResponseSchema>

/**
 * Workers AI の raw レスポンスを Zod で検証し、テキストと usage を抽出する。
 * 検証失敗時は null を返す。
 */
export function parseAiTextResponse(result: unknown): AiTextResponse | null {
  const parsed = AiTextResponseSchema.safeParse(result)
  return parsed.success ? parsed.data : null
}
