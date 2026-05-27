'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { SideNav, type SideNavItem } from './SideNav'
import { selectBookmarks } from '@/store/bookmarks'
import { useAppSelector } from '@/store/hooks'

type NavEntry = {
  href: string
  label: string
  icon: ReactNode
  match: (pathname: string) => boolean
}

const NAV: ReadonlyArray<NavEntry> = [
  {
    href: '/characters',
    label: 'Characters',
    match: (p) => p === '/' || p.startsWith('/characters'),
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'Team',
    match: (p) => p === '/team',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3.5" />
        <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M16 20c0-2 2-3.5 5-3.5" />
      </svg>
    ),
  },
  {
    href: '/bookmarks',
    label: 'Bookmarks',
    match: (p) => p.startsWith('/bookmarks'),
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z" />
      </svg>
    ),
  },
]

export function SideNavContainer() {
  const pathname = usePathname() ?? '/'
  const storedBookmarkCount = useAppSelector(selectBookmarks).length
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const bookmarkCount = mounted ? storedBookmarkCount : 0

  const items: Array<SideNavItem> = NAV.map((entry) => ({
    href: entry.href,
    label: entry.label,
    icon: entry.icon,
    active: entry.match(pathname),
    badgeCount: entry.href === '/bookmarks' ? bookmarkCount : undefined,
  }))

  return <SideNav items={items} />
}
