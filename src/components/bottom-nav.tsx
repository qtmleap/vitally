'use client'

import { Bot, CalendarDays, Home, Settings } from 'lucide-react'
import * as m from 'motion/react-m'
import Link from 'vinext/shims/link'

const navItems = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/day', label: '今日', icon: CalendarDays },
  { href: '/ai', label: 'AI', icon: Bot },
  { href: '/settings', label: '設定', icon: Settings }
]

export function BottomNav() {
  return (
    <m.nav
      className='bg-background/80 fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-sm'
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
    >
      <div className='mx-auto flex max-w-lg items-center justify-around py-2'>
        {navItems.map(({ href, label, icon: Icon }) => (
          <m.div key={href} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
            <Link href={href} className='text-muted-foreground flex flex-col items-center gap-0.5 px-3 py-1'>
              <Icon className='size-5' />
              <span className='text-[10px]'>{label}</span>
            </Link>
          </m.div>
        ))}
      </div>
    </m.nav>
  )
}
