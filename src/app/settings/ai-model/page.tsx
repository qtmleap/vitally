'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Sparkles, Zap } from 'lucide-react'
import * as m from 'motion/react-m'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { type AiCategory, type AiModel, getModelsForCategory } from '@/lib/ai-models'
import type { UserProfileRow } from '@/lib/db'
import { useSkipAnimation } from '@/lib/use-skip-animation'
import { cn } from '@/lib/utils'

const categories: { key: AiCategory; label: string; description: string }[] = [
  { key: 'advice', label: 'AI アドバイス', description: '食事・運動の評価' },
  { key: 'nutrition', label: '栄養推定 / 運動推定', description: '食品の栄養素・消費カロリーの推定' }
]

function ModelCard({
  model,
  selected,
  onSelect
}: {
  model: AiModel
  selected: boolean
  onSelect: () => void
}) {
  const isPro = model.tier === 'pro'

  return (
    <button
      type='button'
      onClick={onSelect}
      disabled={isPro}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
        selected ? 'border-primary bg-primary/5' : isPro ? 'opacity-50' : 'hover:bg-muted'
      )}
    >
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
        )}
      >
        {selected && <Check className='size-3' />}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{model.label}</span>
          {isPro && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
              Pro
            </Badge>
          )}
        </div>
        <div className='text-muted-foreground flex items-center gap-2 text-xs'>
          <Zap className='size-3' />
          <span>~{model.neuronsPerReq} neurons/回</span>
        </div>
      </div>
    </button>
  )
}

export default function AiModelSettingsPage() {
  const skipAnimation = useSkipAnimation()
  const queryClient = useQueryClient()

  const { data: profileData, isLoading } = useQuery<{ profile: UserProfileRow | null }>({
    queryKey: ['profile'],
    queryFn: api.profile.get
  })

  const mutation = useMutation({
    mutationFn: (data: { aiAdviceModel?: string; aiUtilityModel?: string }) =>
      api.profile.updateAiModels(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('AI モデルを変更しました')
    }
  })

  const profile = profileData?.profile

  if (isLoading || !profile) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>
      </div>
    )
  }

  const handleSelect = (category: AiCategory, modelId: string) => {
    if (category === 'advice') {
      mutation.mutate({ aiAdviceModel: modelId })
    } else {
      mutation.mutate({ aiUtilityModel: modelId })
    }
  }

  return (
    <m.div
      className='p-4'
      initial={skipAnimation ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='AI モデル' back />
      <div className='mt-4 space-y-6'>
        {categories.map(({ key, label, description }) => {
          const models = getModelsForCategory(key)
          const currentModel =
            key === 'advice' ? profile.aiAdviceModel : profile.aiUtilityModel

          return (
            <div key={key}>
              <div className='mb-2 flex items-center gap-2'>
                <Sparkles className='text-primary size-4' />
                <h2 className='text-sm font-bold'>{label}</h2>
              </div>
              <p className='text-muted-foreground mb-3 text-xs'>{description}</p>
              <div className='space-y-2'>
                {models.map((model) => (
                  <ModelCard
                    key={`${key}-${model.id}`}
                    model={model}
                    selected={currentModel === model.id || (!currentModel && model === models[0])}
                    onSelect={() => handleSelect(key, model.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        <div className='text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-xs'>
          <p className='font-medium'>無料プランの制限</p>
          <p className='mt-1'>1日あたり 20 回までリクエスト可能です。Pro モデルは有料プランで利用できます。</p>
        </div>
      </div>
    </m.div>
  )
}
