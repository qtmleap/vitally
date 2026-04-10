'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2 } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { MealTemplateRow } from '@/lib/db'
import { type MealType, mealTypeLabels } from '@/lib/schema'
import { useSkipAnimation } from '@/lib/use-skip-animation'

export default function TemplatesPage() {
  const queryClient = useQueryClient()
  const skipAnimation = useSkipAnimation()

  const { data: templates = [], isLoading } = useQuery<MealTemplateRow[]>({
    queryKey: ['templates'],
    queryFn: () => api.listTemplates()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTemplate(undefined, { queries: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('テンプレートを削除しました')
    }
  })

  return (
    <m.div
      className='p-4'
      initial={skipAnimation ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='献立テンプレート' back />

      <div className='mt-4 space-y-3'>
        {isLoading && <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>}

        <AnimatePresence mode='popLayout'>
          {templates.map((template, i) => (
            <m.div
              key={template.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
              className='rounded-xl border px-4 py-3'
            >
              <div className='flex items-start justify-between'>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <Bookmark className='text-primary size-4 shrink-0' />
                    <p className='truncate text-sm font-medium'>{template.name}</p>
                  </div>
                  {template.mealType && (
                    <p className='text-muted-foreground mt-0.5 ml-6 text-xs'>
                      {mealTypeLabels[template.mealType as MealType]}
                    </p>
                  )}
                  <div className='mt-2 ml-6 space-y-0.5'>
                    {template.items.map((item) => (
                      <div key={item.id} className='text-muted-foreground flex items-center justify-between text-xs'>
                        <span>{item.food.name}</span>
                        <span>{Math.round(item.food.calories * item.quantity)} kcal</span>
                      </div>
                    ))}
                  </div>
                  <p className='text-muted-foreground mt-1 ml-6 text-[11px]'>
                    合計 {Math.round(template.items.reduce((s, i) => s + i.food.calories * i.quantity, 0))} kcal ・
                    {template.items.length}品目
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-destructive size-8 shrink-0'
                  onClick={() => deleteMutation.mutate(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
            </m.div>
          ))}
        </AnimatePresence>

        {!isLoading && templates.length === 0 && (
          <m.div
            className='py-12 text-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Bookmark className='text-muted-foreground/40 mx-auto size-10' />
            <p className='text-muted-foreground mt-3 text-sm'>テンプレートがありません</p>
            <p className='text-muted-foreground mt-1 text-xs'>食事追加画面でテンプレートとして保存できます</p>
          </m.div>
        )}
      </div>
    </m.div>
  )
}
