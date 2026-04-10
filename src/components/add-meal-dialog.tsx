'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Bookmark, Check, History, Minus, Plus, Search, Sparkles, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AiThinkingOverlay } from '@/components/ai-thinking-overlay'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UpdatingOverlay } from '@/components/updating-overlay'
import { api } from '@/lib/api'
import type { FoodRow, MealTemplateRow } from '@/lib/db'
import { useDebouncedValue } from '@/lib/hooks'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'
import { useMinPending } from '@/lib/use-min-pending'
import { cn } from '@/lib/utils'

type Unit = 'serving' | 'g'
type MealSource = 'eating_out' | 'home_cooking'

interface BasketItem {
  food: FoodRow
  amount: number
  unit: Unit
}

const basketItemSchema = z.object({
  amount: z.number().min(0.1, '0.1以上を入力')
})

const templateNameSchema = z.object({
  name: z.string().min(1, 'テンプレート名を入力してください')
})

interface AddMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType: MealType
  date: string
}

const QUICK_FRACTIONS = [
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.5 },
  { label: '3/4', value: 0.75 },
  { label: '1', value: 1 }
]

function calcCalories(food: FoodRow, amount: number, unit: Unit): number {
  if (unit === 'serving') return food.calories * amount
  // g モード: serving テキストから基準グラムを抽出、なければ 100g ベース
  const servingGrams = parseServingGrams(food.serving)
  return (food.calories / servingGrams) * amount
}

function parseServingGrams(serving: string): number {
  const match = serving.match(/(\d+)\s*g/i)
  return match ? Number(match[1]) : 100
}

function BasketRow({
  item,
  onRemove,
  onUpdate
}: {
  item: BasketItem
  onRemove: () => void
  onUpdate: (amount: number, unit: Unit) => void
}) {
  const form = useForm<z.infer<typeof basketItemSchema>>({
    resolver: zodResolver(basketItemSchema),
    defaultValues: { amount: item.amount },
    mode: 'onChange'
  })

  const amount = form.watch('amount')
  const unit = item.unit

  const cal = calcCalories(item.food, amount, unit)
  const step = unit === 'g' ? 10 : 0.5
  const servingGrams = parseServingGrams(item.food.serving)

  const adjust = (delta: number) => {
    const next = Math.max(unit === 'g' ? 1 : 0.1, Math.round((amount + delta * step) * 10) / 10)
    form.setValue('amount', next, { shouldValidate: true })
    onUpdate(next, unit)
  }

  const setAmount = (v: number) => {
    form.setValue('amount', v, { shouldValidate: true })
    onUpdate(v, unit)
  }

  const toggleUnit = () => {
    const newUnit: Unit = unit === 'serving' ? 'g' : 'serving'
    const newAmount = newUnit === 'g' ? servingGrams : 1
    form.setValue('amount', newAmount, { shouldValidate: true })
    onUpdate(newAmount, newUnit)
  }

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-2'>
        <button type='button' onClick={onRemove} className='text-muted-foreground hover:text-destructive shrink-0'>
          <X className='size-4' />
        </button>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm'>{item.food.name}</p>
          <p className='text-muted-foreground text-xs'>
            {Math.round(cal)} kcal
            <span className='ml-1 opacity-60'>({item.food.serving})</span>
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <button
            type='button'
            onClick={() => adjust(-1)}
            className='text-muted-foreground hover:text-foreground rounded p-0.5'
          >
            <Minus className='size-3.5' />
          </button>
          <Form {...form}>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      step={unit === 'g' ? 1 : 0.1}
                      onChange={(e) => {
                        const v = Number.parseFloat(e.target.value)
                        if (!Number.isNaN(v)) {
                          field.onChange(v)
                          onUpdate(v, unit)
                        }
                      }}
                      className='h-7 w-14 px-1 text-center text-xs'
                    />
                  </FormControl>
                  <FormMessage className='text-[10px]' />
                </FormItem>
              )}
            />
          </Form>
          <button
            type='button'
            onClick={() => adjust(1)}
            className='text-muted-foreground hover:text-foreground rounded p-0.5'
          >
            <Plus className='size-3.5' />
          </button>
          <button
            type='button'
            onClick={toggleUnit}
            className='text-muted-foreground hover:text-foreground w-10 rounded-md border px-1.5 py-0.5 text-center text-[10px]'
          >
            {unit === 'serving' ? '食分' : 'g'}
          </button>
        </div>
      </div>
      {unit === 'serving' && (
        <div className='flex gap-1 pl-6'>
          {QUICK_FRACTIONS.map((f) => (
            <button
              key={f.label}
              type='button'
              onClick={() => setAmount(f.value)}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] transition-colors',
                amount === f.value
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AddMealDialog({ open, onOpenChange, mealType, date }: AddMealDialogProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [basket, setBasket] = useState<BasketItem[]>([])
  const [mealSource, setMealSource] = useState<MealSource>('eating_out')
  const [showTemplateForm, setShowTemplateForm] = useState(false)

  const templateForm = useForm<z.infer<typeof templateNameSchema>>({
    resolver: zodResolver(templateNameSchema),
    mode: 'onBlur',
    defaultValues: { name: '' }
  })

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', debouncedSearch],
    queryFn: () => api.listFoods({ queries: { q: debouncedSearch || undefined } }),
    enabled: open
  })

  const { data: templates = [] } = useQuery<MealTemplateRow[]>({
    queryKey: ['templates'],
    queryFn: () => api.listTemplates(),
    enabled: open
  })

  const { data: frequentFoods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', 'frequent'],
    queryFn: () => api.listFrequentFoods({ queries: { limit: 5 } }),
    enabled: open
  })

  const filteredTemplates = templates

  const aiMutation = useMutation({
    mutationFn: (name: string) => api.estimateNutrition({ name, save: true }),
    onSuccess: (result, name) => {
      if (result.id && result.name) {
        const food: FoodRow = {
          id: result.id,
          name: result.name,
          calories: result.calories,
          protein: result.protein,
          fat: result.fat,
          carbs: result.carbs,
          serving: result.serving,
          createdAt: result.createdAt ?? dayjs().toISOString()
        }
        setBasket((prev) => {
          if (prev.some((item) => item.food.id === food.id)) return prev
          return [...prev, { food, amount: 1, unit: 'serving' }]
        })
        setSearch('')
        toast.success(`"${name}" の栄養素をAIで推定しました`)
      }
    }
  })

  const saveTemplateMutation = useMutation({
    mutationFn: (name: string) =>
      api.createTemplate({
        name,
        items: basket.map((i) => ({ food_id: i.food.id, quantity: i.amount }))
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('テンプレートを保存しました')
      setShowTemplateForm(false)
      templateForm.reset()
    }
  })

  const addToBasket = useCallback((food: FoodRow) => {
    setBasket((prev) => {
      if (prev.some((item) => item.food.id === food.id)) return prev
      return [...prev, { food, amount: 1, unit: 'serving' }]
    })
  }, [])

  const removeFromBasket = useCallback((foodId: string) => {
    setBasket((prev) => prev.filter((item) => item.food.id !== foodId))
  }, [])

  const updateItem = useCallback((foodId: string, amount: number, unit: Unit) => {
    setBasket((prev) => prev.map((item) => (item.food.id === foodId ? { ...item, amount, unit } : item)))
  }, [])

  const applyTemplate = useCallback((template: MealTemplateRow) => {
    setBasket((prev) => {
      const existingIds = new Set(prev.map((i) => i.food.id))
      const newItems = template.items
        .filter((item) => !existingIds.has(item.food.id))
        .map((item) => ({ food: item.food, amount: item.quantity, unit: 'serving' as Unit }))
      return [...prev, ...newItems]
    })
  }, [])

  const totalCalories = basket.reduce((s, item) => s + calcCalories(item.food, item.amount, item.unit), 0)

  const hasInvalid = basket.some((item) => item.amount < 0.1)

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const item of basket) {
        const quantity = item.unit === 'g' ? item.amount / parseServingGrams(item.food.serving) : item.amount
        await api.createMeal({ date, meal_type: mealType, food_id: item.food.id, quantity })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      toast.success(`${basket.length}品目を追加しました`)
      setBasket([])
      setSearch('')
      setMealSource('eating_out')
      setShowTemplateForm(false)
      templateForm.reset()
      onOpenChange(false)
    }
  })

  const showSaveOverlay = useMinPending(saveMutation.isPending)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setBasket([])
      setSearch('')
      setMealSource('eating_out')
      setShowTemplateForm(false)
      templateForm.reset()
    }
    onOpenChange(next)
  }

  const inBasket = new Set(basket.map((item) => item.food.id))
  const showNoResults = debouncedSearch.length > 0 && foods.length === 0
  const searchPlaceholder =
    mealSource === 'eating_out' ? '料理名を入力（例: 麻婆豆腐）' : '食品名を検索（例: 鶏むね肉）'

  const isSearching = debouncedSearch.length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[85dvh] flex-col gap-0 p-0'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>{mealTypeLabels[mealType]}を追加</DialogTitle>
        </DialogHeader>

        <div className='border-b px-4 pb-3 pt-2 space-y-2'>
          <div className='bg-muted relative flex h-9 w-full rounded-lg border p-0.5'>
            <m.div
              className='bg-background absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md shadow-sm'
              animate={{ left: mealSource === 'eating_out' ? '2px' : 'calc(50% + 0px)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
            {(['eating_out', 'home_cooking'] as const).map((value) => (
              <button
                key={value}
                type='button'
                onClick={() => setMealSource(value)}
                className={cn(
                  'relative z-10 flex-1 text-sm transition-colors duration-200',
                  mealSource === value ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {value === 'eating_out' ? '外食' : '自炊'}
              </button>
            ))}
          </div>

          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className='pl-9'
            />
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-2'>
          {isSearching ? (
            foods.length > 0 ? (
              <div className='space-y-0.5'>
                {foods.map((food, i) => {
                  const selected = inBasket.has(food.id)
                  return (
                    <m.button
                      key={food.id}
                      type='button'
                      onClick={() => (selected ? removeFromBasket(food.id) : addToBasket(food))}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        selected ? 'bg-primary/10' : 'hover:bg-muted'
                      )}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                      whileTap={{ scale: 0.97 }}
                      layout
                    >
                      <m.div
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                        )}
                        animate={selected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {selected && <Check className='size-3' />}
                      </m.div>
                      <div className='flex-1'>
                        <p className='text-sm'>{food.name}</p>
                        <p className='text-muted-foreground text-xs'>
                          {food.calories} kcal / {food.serving}
                        </p>
                      </div>
                    </m.button>
                  )
                })}
              </div>
            ) : showNoResults ? (
              <m.div
                className='flex flex-col items-center gap-3 py-8'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <p className='text-muted-foreground text-sm'>見つかりません</p>
                {mealSource === 'eating_out' ? (
                  <Button
                    type='button'
                    onClick={() => aiMutation.mutate(search)}
                    disabled={aiMutation.isPending}
                    className='gap-2'
                  >
                    <Sparkles className='size-4' />
                    {aiMutation.isPending ? '推定中...' : 'AI で栄養素を推定'}
                  </Button>
                ) : (
                  <a href='/foods/new' className='text-primary text-sm underline underline-offset-4 hover:opacity-80'>
                    新しい食品を登録する
                  </a>
                )}
              </m.div>
            ) : null
          ) : (
            <div className='space-y-4'>
              {filteredTemplates.length > 0 && (
                <div>
                  <p className='text-muted-foreground mb-2 text-xs font-medium'>テンプレート</p>
                  <div className='flex gap-2 overflow-x-auto pb-1'>
                    {filteredTemplates.map((template, i) => (
                      <m.button
                        key={template.id}
                        type='button'
                        onClick={() => applyTemplate(template)}
                        className='bg-muted hover:bg-muted/80 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors'
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Bookmark className='size-3 text-muted-foreground' />
                        <span>{template.name}</span>
                        <span className='text-muted-foreground text-xs'>({template.items.length}品)</span>
                      </m.button>
                    ))}
                  </div>
                </div>
              )}

              {frequentFoods.length > 0 && (
                <div>
                  <div className='mb-2 flex items-center gap-1.5'>
                    <History className='text-muted-foreground size-3.5' />
                    <p className='text-muted-foreground text-xs font-medium'>よく使う食品</p>
                  </div>
                  <div className='space-y-0.5'>
                    {frequentFoods.map((food, i) => {
                      const selected = inBasket.has(food.id)
                      return (
                        <m.button
                          key={food.id}
                          type='button'
                          onClick={() => (selected ? removeFromBasket(food.id) : addToBasket(food))}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            selected ? 'bg-primary/10' : 'hover:bg-muted'
                          )}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                          whileTap={{ scale: 0.97 }}
                          layout
                        >
                          <m.div
                            className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/30'
                            )}
                            animate={selected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {selected && <Check className='size-3' />}
                          </m.div>
                          <div className='flex-1'>
                            <p className='text-sm'>{food.name}</p>
                            <p className='text-muted-foreground text-xs'>
                              {food.calories} kcal / {food.serving}
                            </p>
                          </div>
                        </m.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredTemplates.length === 0 && frequentFoods.length === 0 && (
                <m.p
                  className='text-muted-foreground py-8 text-center text-sm'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {mealSource === 'eating_out' ? '料理名を入力してください' : '食品名を検索してください'}
                </m.p>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {basket.length > 0 && (
            <m.div
              className='border-t px-4 py-3'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className='mb-3 space-y-2'>
                <AnimatePresence mode='popLayout'>
                  {basket.map((item) => (
                    <m.div
                      key={item.food.id}
                      layout
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <BasketRow
                        item={item}
                        onRemove={() => removeFromBasket(item.food.id)}
                        onUpdate={(amount, unit) => updateItem(item.food.id, amount, unit)}
                      />
                    </m.div>
                  ))}
                </AnimatePresence>
              </div>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='space-y-1'
              >
                <Button
                  onClick={() => saveMutation.mutate()}
                  className='w-full'
                  disabled={saveMutation.isPending || hasInvalid}
                >
                  {saveMutation.isPending
                    ? '保存中...'
                    : `${basket.length}品目を追加（${Math.round(totalCalories)} kcal）`}
                </Button>

                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='w-full gap-1.5'
                  onClick={() => setShowTemplateForm((v) => !v)}
                >
                  <Bookmark className='size-3.5' />
                  テンプレートとして保存
                </Button>

                <AnimatePresence>
                  {showTemplateForm && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className='overflow-hidden'
                    >
                      <Form {...templateForm}>
                        <form
                          onSubmit={templateForm.handleSubmit((data) => saveTemplateMutation.mutate(data.name))}
                          className='flex gap-2 pt-1'
                        >
                          <FormField
                            control={templateForm.control}
                            name='name'
                            render={({ field }) => (
                              <FormItem className='flex-1 space-y-0'>
                                <FormControl>
                                  <Input
                                    {...field}
                                    autoFocus
                                    placeholder='テンプレート名（例: いつもの朝食）'
                                    className='h-8 text-sm'
                                  />
                                </FormControl>
                                <FormMessage className='text-[10px]' />
                              </FormItem>
                            )}
                          />
                          <Button
                            type='submit'
                            size='sm'
                            className='h-8 shrink-0'
                            disabled={saveTemplateMutation.isPending}
                          >
                            {saveTemplateMutation.isPending ? '保存中...' : '保存'}
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-8 shrink-0'
                            onClick={() => {
                              setShowTemplateForm(false)
                              templateForm.reset()
                            }}
                          >
                            キャンセル
                          </Button>
                        </form>
                      </Form>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </DialogContent>
      <AiThinkingOverlay show={aiMutation.isPending} message='栄養素を推定中...' />
      <UpdatingOverlay show={showSaveOverlay} message='食事を保存中...' />
    </Dialog>
  )
}
