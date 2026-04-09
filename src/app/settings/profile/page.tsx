'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dumbbell, Percent, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import * as m from 'motion/react-m'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'vinext/shims/navigation'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { api } from '@/lib/api'
import { calculateCalorieGoal } from '@/lib/calorie-calc'
import type { UserProfileRow } from '@/lib/db'
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
import { useSkipAnimation } from '@/lib/use-skip-animation'
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

export default function ProfileSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const skipAnimation = useSkipAnimation()

  const { data: profileData, isLoading } = useQuery<{ profile: UserProfileRow | null }>({
    queryKey: ['profile'],
    queryFn: api.profile.get
  })

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

  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile
      form.reset({
        age: p.age,
        height_cm: p.heightCm,
        weight_kg: p.weightKg,
        body_fat_pct: p.bodyFatPct,
        gender: p.gender as ProfileInput['gender'],
        activity_level: p.activityLevel as ProfileInput['activity_level'],
        goals: p.goals as ProfileInput['goals']
      })
    }
  }, [profileData, form])

  const mutation = useMutation({
    mutationFn: api.profile.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('プロフィールを更新しました')
      router.back()
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

  const onSubmit = (values: ProfileInput) => {
    mutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>
      </div>
    )
  }

  return (
    <m.div
      className='p-4'
      initial={skipAnimation ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='プロフィール・目標' back />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-5'>
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

          <div className='grid grid-cols-2 gap-3'>
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
          </div>

          <div className='grid grid-cols-2 gap-3'>
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

          {previewCalorie && (
            <Card>
              <CardContent className='py-4 text-center'>
                <p className='text-muted-foreground text-xs'>目標カロリー</p>
                <p className='mt-1 text-3xl font-bold'>
                  {previewCalorie}
                  <span className='text-muted-foreground ml-1 text-sm font-normal'>kcal/日</span>
                </p>
              </CardContent>
            </Card>
          )}

          <Button type='submit' className='w-full' disabled={mutation.isPending}>
            {mutation.isPending ? '保存中...' : '保存'}
          </Button>
        </form>
      </Form>
    </m.div>
  )
}
