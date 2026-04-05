'use client'

import { Bot, Dumbbell, Home, UtensilsCrossed } from 'lucide-react'
import Link from 'vinext/shims/link'

const navItems = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/meals', label: '食事', icon: UtensilsCrossed },
  { href: '/exercises', label: '運動', icon: Dumbbell },
  { href: '/ai', label: 'AI', icon: Bot }
]

export function BottomNav() {
  return (
    <nav className='bg-background/80 fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-sm'>
      <div className='mx-auto flex max-w-lg items-center justify-around py-2'>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className='text-muted-foreground flex flex-col items-center gap-0.5 px-3 py-1'>
            <Icon className='size-5' />
            <span className='text-[10px]'>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
