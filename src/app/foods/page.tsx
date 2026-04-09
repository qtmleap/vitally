'use client'

import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ScanBarcode, Search, Trash2 } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import Link from 'vinext/shims/link'
import { Suspense, useState } from 'react'

import { BarcodeScanner } from '@/components/barcode-scanner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useSkipAnimation } from '@/lib/use-skip-animation'
import type { FoodRow } from '@/lib/db'

function FoodsPageContent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const skipAnimation = useSkipAnimation()

  const { data: foods } = useSuspenseQuery<FoodRow[]>({
    queryKey: ['foods', search],
    queryFn: () => api.foods.list(search || undefined)
  })

  const deleteMutation = useMutation({
    mutationFn: api.foods.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods'] })
  })

  const handleBarcodeResult = async (result: { name: string; calories: number; protein: number; fat: number; carbs: number; serving: string }) => {
    await api.foods.create({
      name: result.name,
      calories: result.calories,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      serving: result.serving
    })
    queryClient.invalidateQueries({ queryKey: ['foods'] })
  }

  return (
    <m.div
      className='p-4'
      initial={skipAnimation ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='食品管理' back>
        <div className='flex gap-1'>
          <Button variant='outline' size='icon' className='size-8' onClick={() => setScannerOpen(true)}>
            <ScanBarcode className='size-4' />
          </Button>
          <Button asChild size='sm'>
            <Link href='/foods/new'>
              <Plus className='mr-1 size-4' />
              追加
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className='relative mt-4'>
        <Search className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2' />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='食品を検索...'
          className='pl-9'
        />
      </div>

      <div className='mt-4 space-y-1'>
        <AnimatePresence mode='popLayout'>
          {foods.map((food) => (
            <m.div
              key={food.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-muted'
            >
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{food.name}</p>
                <p className='text-muted-foreground text-xs'>
                  {food.calories} kcal / P:{food.protein}g F:{food.fat}g C:{food.carbs}g
                  <span className='ml-1 opacity-60'>({food.serving})</span>
                </p>
              </div>
              <m.button
                type='button'
                whileTap={{ scale: 0.8 }}
                onClick={() => deleteMutation.mutate(food.id)}
                className='text-muted-foreground hover:text-destructive shrink-0 p-1'
              >
                <Trash2 className='size-4' />
              </m.button>
            </m.div>
          ))}
        </AnimatePresence>
        {foods.length === 0 && (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            {search ? '見つかりません' : '食品が登録されていません'}
          </p>
        )}
      </div>

      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onResult={handleBarcodeResult} />
    </m.div>
  )
}

export default function FoodsPage() {
  return (
    <Suspense fallback={<div className='p-4'><p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p></div>}>
      <FoodsPageContent />
    </Suspense>
  )
}
