'use client'

import {
  ChevronRight,
  Database,
  Heart,
  Info,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  UtensilsCrossed
} from 'lucide-react'
import * as m from 'motion/react-m'
import Link from 'vinext/shims/link'
import type { ReactNode } from 'react'

import { PageHeader } from '@/components/page-header'
import { useDarkMode } from '@/components/providers'

const APP_VERSION = '0.1.0'

function SettingsGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className='text-muted-foreground mb-1 px-4 text-[11px] font-semibold uppercase tracking-wider'>{label}</p>
      <div className='bg-muted/40 divide-border divide-y rounded-2xl'>{children}</div>
    </div>
  )
}

function SettingsRow({
  icon,
  label,
  value,
  href,
  onClick,
  destructive
}: {
  icon: ReactNode
  label: string
  value?: string
  href?: string
  onClick?: () => void
  destructive?: boolean
}) {
  const inner = (
    <>
      <div className='flex items-center gap-3'>
        <span className={destructive ? 'text-destructive' : 'text-muted-foreground'}>{icon}</span>
        <span className={`text-sm font-medium ${destructive ? 'text-destructive' : ''}`}>{label}</span>
      </div>
      <div className='flex items-center gap-1'>
        {value && <span className='text-muted-foreground text-sm'>{value}</span>}
        {href && <ChevronRight className='text-muted-foreground size-4' />}
      </div>
    </>
  )

  const cls = 'flex w-full items-center justify-between px-4 py-3.5 transition-colors active:bg-muted/60'

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button type='button' onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

export default function SettingsPage() {
  const { dark, toggle } = useDarkMode()

  const handleClearCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <m.div
      className='p-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='設定' />
      <div className='mt-2 space-y-6'>
        <SettingsGroup label='一般'>
          <SettingsRow
            icon={dark ? <Moon className='size-5' /> : <Sun className='size-5' />}
            label='テーマ'
            value={dark ? 'ダーク' : 'ライト'}
            onClick={toggle}
          />
          <SettingsRow
            icon={<Palette className='size-5' />}
            label='アクセントカラー'
            value='グリーン'
          />
        </SettingsGroup>

        <SettingsGroup label='データ'>
          <SettingsRow icon={<UtensilsCrossed className='size-5' />} label='食品管理' href='/foods' />
          <SettingsRow icon={<Database className='size-5' />} label='データエクスポート' value='準備中' />
          <SettingsRow
            icon={<Trash2 className='size-5' />}
            label='キャッシュを削除'
            onClick={handleClearCache}
            destructive
          />
        </SettingsGroup>

        <SettingsGroup label='アプリについて'>
          <SettingsRow icon={<Info className='size-5' />} label='バージョン' value={`v${APP_VERSION}`} />
          <SettingsRow icon={<Shield className='size-5' />} label='プライバシーポリシー' value='準備中' />
          <SettingsRow icon={<Heart className='size-5' />} label='ライセンス' value='MIT' />
        </SettingsGroup>

        <m.div
          className='pt-2 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className='text-muted-foreground/60 text-xs'>HealthLog v{APP_VERSION}</p>
          <p className='text-muted-foreground/40 text-[10px]'>Built with Vinext + Cloudflare Workers</p>
        </m.div>
      </div>
    </m.div>
  )
}
