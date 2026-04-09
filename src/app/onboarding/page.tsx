'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Dumbbell, Scale, TrendingDown, TrendingUp } from 'lucide-react'
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
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
      goal: 'maintain'
    }
  })

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
          goal: watchAll.goal
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
    <div className='flex min-h-dvh flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mb-8 text-center'>
          <h1 className='text-2xl font-bold'>Vitally</h1>
          <p className='text-muted-foreground mt-1 text-sm'>あなたに合った目標を設定しましょう</p>
        </m.div>

        {/* Step indicator */}
        <div className='mb-6 flex items-center justify-center gap-2'>
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn('h-1.5 rounded-full transition-all', s === step ? 'bg-primary w-8' : 'bg-muted w-4')}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode='wait' custom={step}>
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
                  <Button type='button' className='w-full gap-2' disabled={!canGoToStep2} onClick={() => setStep(2)}>
                    次へ
                    <ArrowRight className='size-4' />
                  </Button>
                </m.div>
              )}

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
                    name='goal'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目標</FormLabel>
                        <div className='grid grid-cols-3 gap-2'>
                          {goals.map((g) => {
                            const Icon = goalIcons[g]
                            return (
                              <button
                                key={g}
                                type='button'
                                onClick={() => field.onChange(g)}
                                className={cn(
                                  'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors',
                                  field.value === g ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                                )}
                              >
                                <Icon
                                  className={cn(
                                    'size-5',
                                    field.value === g ? 'text-primary' : 'text-muted-foreground'
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
