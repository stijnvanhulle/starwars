'use client'

import Badge from '@mui/material/Badge'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { selectBookmarks } from '@/store/bookmarks'
import { useAppSelector } from '@/store/hooks'

const NAV: Array<{ href: string; label: string; icon: ReactNode; match: (p: string) => boolean }> = [
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

  return (
    <Stack spacing={1} sx={{ alignItems: 'center', py: 4, position: 'sticky', top: 0, height: '100vh' }}>
      <Stack
        component={Link}
        href="/"
        aria-label="Whale Star Wars Team Builder, home"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'common.white',
          textDecoration: 'none',
          mb: 4,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width={28}
          height={28}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 17c2-5 7-8 13-8s11 3 13 8c-2 5-7 8-13 8s-11-3-13-8z" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </Stack>
      {NAV.map((item) => {
        const active = item.match(pathname)
        const isBookmarks = item.href === '/bookmarks'
        const iconContent = isBookmarks ? (
          <Badge badgeContent={bookmarkCount} color="primary" overlap="circular" invisible={bookmarkCount === 0}>
            {item.icon}
          </Badge>
        ) : (
          item.icon
        )
        return (
          <Tooltip key={item.href} title={item.label} placement="right">
            <ListItemButton
              component={Link}
              href={item.href}
              selected={active}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              alignItems={'center'}
              sx={{
                width: 48,
                height: 48,
                flex: 'none',
                borderRadius: 3,
                justifyContent: 'center',
                color: active ? 'common.white' : 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'secondary.main', color: 'common.white' },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'common.white' },
              }}
            >
              {iconContent}
            </ListItemButton>
          </Tooltip>
        )
      })}
    </Stack>
  )
}
