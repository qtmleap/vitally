'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Dumbbell,
  Flame,
  Percent,
  Scale,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed
} from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'vinext/shims/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { api } from '@/lib/api'
import { calculateCalorieGoal } from '@/lib/calorie-calc'
import {
  type ActivityLevel,
  type GoalType,
  type ProfileInput,
  activityLevelLabels,
  activityLevels,
  genderLabels,
  genders,
  goalLabels,
  goals,
  profileSchema
} from '@/lib/schema'
import { cn } from '@/lib/utils'

const goalIcons: Record<GoalType, typeof Scale> = {
  lose_weight: TrendingDown,
  lose_fat: Percent,
  maintain: Scale,
  gain_muscle: TrendingUp
}

const activityDescriptions: Record<ActivityLevel, string> = {
  sedentary: 'デスクワーク中心',
  light: 'ウォーキングや軽い筋トレ',
  moderate: 'ジョギングや水泳',
  active: 'ハードなトレーニング',
  very_active: 'アスリートレベル'
}

const TOTAL_STEPS = 3

const features = [
  {
    icon: UtensilsCrossed,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    title: '食事を記録',
    description: '毎日の食事をかんたんに記録。カロリーと栄養素を自動計算します'
  },
  {
    icon: Dumbbell,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: '運動を管理',
    description: '運動の消費カロリーを記録して、1日のバランスを確認'
  },
  {
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    title: 'カロリー目標',
    description: 'あなたに合った目標を自動設定。毎日の進捗が一目でわかります'
  },
  {
    icon: Bot,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    title: 'AI アドバイス',
    description: 'AI があなたの食事バランスを評価して改善点をアドバイス'
  }
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as never,
    defaultValues: {
      age: undefined as unknown as number,
      height_cm: undefined as unknown as number,
      weight_kg: undefined as unknown as number,
      body_fat_pct: null,
      gender: 'male',
      activity_level: 'moderate',
      goals: ['maintain']
    }
  })

  const toggleGoal = (g: GoalType) => {
    const current = form.getValues('goals')
    if (g === 'maintain') {
      form.setValue('goals', ['maintain'], { shouldValidate: true })
    } else {
      const without = current.filter((v) => v !== 'maintain' && v !== g)
      const next = current.includes(g) ? without : [...without, g]
      form.setValue('goals', next.length > 0 ? next : ['maintain'], { shouldValidate: true })
    }
  }

  const mutation = useMutation({
    mutationFn: api.profile.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('プロフィールを保存しました')
      router.push('/')
    }
  })

  const watchAll = form.watch()

  const previewCalorie =
    watchAll.age && watchAll.height_cm && watchAll.weight_kg && watchAll.gender
      ? calculateCalorieGoal({
          age: watchAll.age,
          heightCm: watchAll.height_cm,
          weightKg: watchAll.weight_kg,
          gender: watchAll.gender,
          activityLevel: watchAll.activity_level,
          goals: watchAll.goals
        })
      : null

  const canGoToStep2 =
    watchAll.gender && watchAll.age >= 10 && watchAll.height_cm >= 100 && watchAll.weight_kg >= 30

  const onSubmit = (values: ProfileInput) => {
    mutation.mutate(values)
  }

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 })
  }

  return (
    <div className='flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Step indicator */}
        <div className='mb-6 flex items-center justify-center gap-2'>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn('h-1.5 rounded-full transition-all', i === step ? 'bg-primary w-8' : 'bg-muted w-4')}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode='wait' custom={step}>
              {/* Step 0: Welcome */}
              {step === 0 && (
                <m.div
                  key='step0'
                  custom={1}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className='space-y-6'
                >
                  <div className='text-center'>
                    <m.h1
                      className='text-3xl font-bold'
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Vitally へようこそ
                    </m.h1>
                    <m.p
                      className='text-muted-foreground mt-2 text-sm'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      健康的な毎日をサポートするアプリです
                    </m.p>
                  </div>

                  <div className='space-y-3'>
                    {features.map((f, i) => (
                      <m.div
                        key={f.title}
                        className='flex items-start gap-3 rounded-xl border px-4 py-3'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                      >
                        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', f.bg)}>
                          <f.icon className={cn('size-4.5', f.color)} />
                        </div>
                        <div>
                          <p className='text-sm font-medium'>{f.title}</p>
                          <p className='text-muted-foreground text-xs leading-relaxed'>{f.description}</p>
                        </div>
                      </m.div>
                    ))}
                  </div>

                  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Button type='button' className='w-full gap-2' onClick={() => setStep(1)}>
                      はじめる
                      <ArrowRight className='size-4' />
                    </Button>
                  </m.div>
                </m.div>
              )}

              {/* Step 1: Profile */}
              {step === 1 && (
                <m.div
                  key='step1'
                  custom={1}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className='space-y-5'
                >
                  <div className='text-center'>
                    <h2 className='text-lg font-bold'>あなたのことを教えてください</h2>
                    <p className='text-muted-foreground mt-1 text-xs'>最適なカロリー目標を計算します</p>
                  </div>

                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性別</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type='single'
                            value={field.value}
                            onValueChange={(v) => v && field.onChange(v)}
                            className='w-full'
                          >
                            {genders.map((g) => (
                              <ToggleGroupItem key={g} value={g} className='flex-1'>
                                {genderLabels[g]}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='age'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年齢</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='25'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='height_cm'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>身長 (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='170'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='weight_kg'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>体重 (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='65'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='body_fat_pct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>体脂肪率 % (任意)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='20'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex gap-2'>
                    <Button type='button' variant='outline' className='gap-1' onClick={() => setStep(0)}>
                      <ArrowLeft className='size-4' />
                      戻る
                    </Button>
                    <Button
                      type='button'
                      className='flex-1 gap-2'
                      disabled={!canGoToStep2}
                      onClick={() => setStep(2)}
                    >
                      次へ
                      <ArrowRight className='size-4' />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* Step 2: Goal */}
              {step === 2 && (
                <m.div
                  key='step2'
                  custom={2}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className='space-y-5'
                >
                  <div className='text-center'>
                    <h2 className='text-lg font-bold'>目標を設定しましょう</h2>
                    <p className='text-muted-foreground mt-1 text-xs'>あとから変更できます</p>
                  </div>

                  <FormField
                    control={form.control}
                    name='activity_level'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活動レベル</FormLabel>
                        <div className='space-y-2'>
                          {activityLevels.map((level) => (
                            <button
                              key={level}
                              type='button'
                              onClick={() => field.onChange(level)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                                field.value === level ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                              )}
                            >
                              <Dumbbell
                                className={cn(
                                  'size-4 shrink-0',
                                  field.value === level ? 'text-primary' : 'text-muted-foreground'
                                )}
                              />
                              <div>
                                <p className='text-sm font-medium'>{activityLevelLabels[level]}</p>
                                <p className='text-muted-foreground text-xs'>{activityDescriptions[level]}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='goals'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目標 (複数選択可)</FormLabel>
                        <div className='grid grid-cols-2 gap-2'>
                          {goals.map((g) => {
                            const Icon = goalIcons[g]
                            const selected = (field.value as GoalType[]).includes(g)
                            return (
                              <button
                                key={g}
                                type='button'
                                onClick={() => toggleGoal(g)}
                                className={cn(
                                  'flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                                  selected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                                )}
                              >
                                <Icon
                                  className={cn(
                                    'size-4.5 shrink-0',
                                    selected ? 'text-primary' : 'text-muted-foreground'
                                  )}
                                />
                                <span className='text-xs font-medium'>{goalLabels[g]}</span>
                              </button>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Calorie preview */}
                  {previewCalorie && (
                    <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card>
                        <CardContent className='py-4 text-center'>
                          <p className='text-muted-foreground text-xs'>あなたの目標カロリー</p>
                          <p className='mt-1 text-3xl font-bold'>
                            {previewCalorie}
                            <span className='text-muted-foreground ml-1 text-sm font-normal'>kcal/日</span>
                          </p>
                        </CardContent>
                      </Card>
                    </m.div>
                  )}

                  <div className='flex gap-2'>
                    <Button type='button' variant='outline' className='gap-1' onClick={() => setStep(1)}>
                      <ArrowLeft className='size-4' />
                      戻る
                    </Button>
                    <Button type='submit' className='flex-1' disabled={mutation.isPending}>
                      {mutation.isPending ? '保存中...' : '始める'}
                    </Button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </div>
    </div>
  )
}
