type AiRunOptions = NonNullable<Parameters<Ai['run']>[2]>

/**
 * Returns AI Gateway options for env.AI.run() if AI_GATEWAY_ID is set.
 * Falls back to undefined (direct Workers AI) when unset so local dev
 * without a configured gateway still works.
 */
export function aiGatewayOptions(
  env: { AI_GATEWAY_ID?: string },
  metadata?: Record<string, string>
): AiRunOptions | undefined {
  if (!env.AI_GATEWAY_ID) return undefined
  return {
    gateway: {
      id: env.AI_GATEWAY_ID,
      ...(metadata ? { metadata } : {})
    }
  }
}
